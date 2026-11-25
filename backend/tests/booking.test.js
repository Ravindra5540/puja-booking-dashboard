import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import { once } from 'node:events';
import mongoose from 'mongoose';
import app from '../app.js';
import Booking from '../models/Booking.js';

const databaseUri = process.env.TEST_MONGODB_URI;

describe('Booking API integration', { skip: !databaseUri }, () => {
  let server;
  let baseUrl;

  before(async () => {
    const databaseName = new URL(databaseUri).pathname.replace(/^\//, '');
    if (!/(^|[-_])test($|[-_])/i.test(databaseName)) {
      throw new Error('TEST_MONGODB_URI must point to a database with "test" in its name.');
    }
    await mongoose.connect(databaseUri);
    await Booking.syncIndexes();
    server = app.listen(0);
    await once(server, 'listening');
    baseUrl = `http://127.0.0.1:${server.address().port}/api/bookings`;
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    await Booking.create([
      { bookingId: 'TEST-001', devoteeName: 'Meera Iyer', pujaName: 'Ganesh Puja', date: new Date('2026-01-03'), amount: 5000, status: 'Confirmed' },
      { bookingId: 'TEST-002', devoteeName: 'Meera Iyer', pujaName: 'Lakshmi Puja', date: new Date('2026-01-04'), amount: 8000, status: 'Confirmed' },
      { bookingId: 'TEST-003', devoteeName: 'Meera Iyer', pujaName: 'Satyanarayan Puja', date: new Date('2026-01-05'), amount: 9000, status: 'Completed' },
      { bookingId: 'TEST-004', devoteeName: 'Arjun Rao', pujaName: 'Ganesh Puja', date: new Date('2026-01-06'), amount: 7000, status: 'Confirmed' }
    ]);
  });

  afterEach(async () => {
    await Booking.deleteMany({});
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
  });

  async function request(path = '', options) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    });
    return { response, body: await response.json() };
  }

  it('lists bookings with pagination metadata and database-backed summaries', async () => {
    const { response, body } = await request('?page=1&limit=2');
    assert.equal(response.status, 200);
    assert.equal(body.data.length, 2);
    assert.deepEqual(body.pagination, { page: 1, limit: 2, total: 4, totalPages: 2 });
    assert.deepEqual(body.summary, {
      totalBookings: 4,
      statuses: { Pending: 0, Confirmed: 3, 'In Progress': 0, Completed: 1 }
    });
  });

  it('combines search, status, sorting, and pagination', async () => {
    const { response, body } = await request(
      '?search=Meera&status=Confirmed&sortBy=amount&order=desc&page=1&limit=1'
    );
    assert.equal(response.status, 200);
    assert.equal(body.pagination.total, 2);
    assert.equal(body.data[0].amount, 8000);
  });

  it('rejects invalid listing parameters and sort fields', async () => {
    assert.equal((await request('?sortBy=__proto__')).response.status, 400);
    assert.equal((await request('?page=0')).response.status, 400);
    assert.equal((await request('?status=Unknown')).response.status, 400);
  });

  it('fetches one booking and distinguishes malformed and missing IDs', async () => {
    const booking = await Booking.findOne({ bookingId: 'TEST-001' });
    assert.equal((await request(`/${booking.id}`)).response.status, 200);
    assert.equal((await request('/not-an-id')).response.status, 400);
    assert.equal((await request('/507f1f77bcf86cd799439011')).response.status, 404);
  });

  it('creates a booking and validates required fields', async () => {
    const valid = { devoteeName: 'Kavya Rao', pujaName: 'Ganesh Puja', date: '2026-04-15', amount: 3500 };
    const created = await request('', { method: 'POST', body: JSON.stringify(valid) });
    assert.equal(created.response.status, 201);
    assert.match(created.body.data.bookingId, /^AS\d+$/);
    assert.equal((await request('', { method: 'POST', body: JSON.stringify({ devoteeName: 'Kavya' }) })).response.status, 400);
  });

  it('edits allowed fields and rejects internal properties', async () => {
    const booking = await Booking.findOne({ bookingId: 'TEST-001' });
    const edited = await request(`/${booking.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ devoteeName: 'Meera Sharma', amount: 5200 })
    });
    assert.equal(edited.response.status, 200);
    assert.equal(edited.body.data.amount, 5200);
    assert.equal((await request(`/${booking.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ bookingId: 'OVERRIDE' })
    })).response.status, 400);
  });

  it('updates only valid booking statuses', async () => {
    const booking = await Booking.findOne({ bookingId: 'TEST-001' });
    const updated = await request(`/${booking.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'In Progress' })
    });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.data.status, 'In Progress');
    assert.equal((await request(`/${booking.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Cancelled' })
    })).response.status, 400);
  });

  it('deletes bookings and reports malformed or nonexistent IDs', async () => {
    const booking = await Booking.findOne({ bookingId: 'TEST-001' });
    assert.equal((await request(`/${booking.id}`, { method: 'DELETE' })).response.status, 200);
    assert.equal((await request('/bad-id', { method: 'DELETE' })).response.status, 400);
    assert.equal((await request('/507f1f77bcf86cd799439011', { method: 'DELETE' })).response.status, 404);
  });
});

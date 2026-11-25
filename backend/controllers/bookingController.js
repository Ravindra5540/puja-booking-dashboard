import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { generateBookingId } from '../utils/generateBookingId.js';

const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed'];
const sortableFields = ['date', 'amount', 'devoteeName', 'createdAt'];
const editableFields = ['devoteeName', 'pujaName', 'date', 'amount', 'contactNumber', 'notes'];
const createFields = [...editableFields, 'status'];

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateAllowedFields(body, allowedFields, requiredFields = []) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw badRequest('Request body must be a JSON object.');
  }

  const invalidFields = Object.keys(body).filter((key) => !allowedFields.includes(key));
  if (invalidFields.length) {
    throw badRequest(`Unsupported field: ${invalidFields.join(', ')}.`);
  }

  const missingFields = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );
  if (missingFields.length) {
    throw badRequest(`Required fields are missing: ${missingFields.join(', ')}.`);
  }

  for (const field of ['devoteeName', 'pujaName']) {
    if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].trim().length < 2)) {
      throw badRequest(`${field} must be a string with at least 2 characters.`);
    }
  }

  if (body.date !== undefined && (typeof body.date !== 'string' || !Number.isFinite(Date.parse(body.date)))) {
    throw badRequest('date must be a valid date string.');
  }

  if (body.amount !== undefined && (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0)) {
    throw badRequest('amount must be a non-negative number.');
  }

  if (body.status !== undefined && !statuses.includes(body.status)) {
    throw badRequest(`status must be one of: ${statuses.join(', ')}.`);
  }

  if (body.contactNumber !== undefined && typeof body.contactNumber !== 'string') {
    throw badRequest('contactNumber must be a string.');
  }
  if (body.notes !== undefined && typeof body.notes !== 'string') {
    throw badRequest('notes must be a string.');
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePositiveInteger(value, name, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  if (value === undefined) {
    return fallback;
  }

  if (!/^[1-9]\d*$/.test(value) || Number(value) > maximum) {
    throw badRequest(`${name} must be a positive integer no greater than ${maximum}.`);
  }
  return Number(value);
}

export async function listBookings(request, response) {
  const { search, status, sortBy = 'date', order = 'desc' } = request.query;
  const page = parsePositiveInteger(request.query.page, 'page', 1);
  const limit = parsePositiveInteger(request.query.limit, 'limit', 10, 100);
  if (!Number.isSafeInteger((page - 1) * limit)) {
    throw badRequest('The requested page is too large.');
  }

  if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
    throw badRequest('search must be a string of 100 characters or fewer.');
  }
  if (status !== undefined && !statuses.includes(status)) {
    throw badRequest(`status must be one of: ${statuses.join(', ')}.`);
  }
  if (!sortableFields.includes(sortBy)) {
    throw badRequest(`sortBy must be one of: ${sortableFields.join(', ')}.`);
  }
  if (!['asc', 'desc'].includes(order)) {
    throw badRequest('order must be asc or desc.');
  }

  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (search && search.trim()) {
    const expression = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [
      { bookingId: expression },
      { devoteeName: expression },
      { pujaName: expression }
    ];
  }

  const [bookings, total, statusCounts, totalBookings] = await Promise.all([
    Booking.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.countDocuments()
  ]);
  const summary = Object.fromEntries(statuses.map((item) => [item, 0]));
  for (const item of statusCounts) {
    summary[item._id] = item.count;
  }

  response.json({
    success: true,
    message: 'Bookings retrieved successfully.',
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    summary: {
      totalBookings,
      statuses: summary
    }
  });
}

export async function getBooking(request, response) {
  if (!mongoose.isObjectIdOrHexString(request.params.id)) {
    throw badRequest('Booking ID is malformed.');
  }

  const booking = await Booking.findById(request.params.id);
  if (!booking) {
    const error = new Error('Booking not found.');
    error.statusCode = 404;
    throw error;
  }

  response.json({ success: true, message: 'Booking retrieved successfully.', data: booking });
}

export async function createBooking(request, response) {
  validateAllowedFields(request.body, createFields, ['devoteeName', 'pujaName', 'date', 'amount']);
  let booking;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      booking = await Booking.create({
        ...request.body,
        bookingId: await generateBookingId()
      });
      break;
    } catch (error) {
      if (error.code !== 11000 || attempt === 2) {
        throw error;
      }
    }
  }

  response.status(201).json({
    success: true,
    message: 'Booking created successfully.',
    data: booking
  });
}

export async function updateBooking(request, response) {
  validateAllowedFields(request.body, editableFields);
  if (!Object.keys(request.body).length) {
    throw badRequest('Provide at least one editable field.');
  }
  if (!mongoose.isObjectIdOrHexString(request.params.id)) {
    throw badRequest('Booking ID is malformed.');
  }

  const booking = await Booking.findByIdAndUpdate(
    request.params.id,
    { $set: request.body },
    { new: true, runValidators: true }
  );
  if (!booking) {
    const error = new Error('Booking not found.');
    error.statusCode = 404;
    throw error;
  }
  response.json({ success: true, message: 'Booking updated successfully.', data: booking });
}

export async function updateBookingStatus(request, response) {
  validateAllowedFields(request.body, ['status'], ['status']);
  if (!mongoose.isObjectIdOrHexString(request.params.id)) {
    throw badRequest('Booking ID is malformed.');
  }

  const booking = await Booking.findByIdAndUpdate(
    request.params.id,
    { $set: { status: request.body.status } },
    { new: true, runValidators: true }
  );
  if (!booking) {
    const error = new Error('Booking not found.');
    error.statusCode = 404;
    throw error;
  }
  response.json({ success: true, message: 'Booking status updated successfully.', data: booking });
}

export async function deleteBooking(request, response) {
  if (!mongoose.isObjectIdOrHexString(request.params.id)) {
    throw badRequest('Booking ID is malformed.');
  }
  const booking = await Booking.findByIdAndDelete(request.params.id);
  if (!booking) {
    const error = new Error('Booking not found.');
    error.statusCode = 404;
    throw error;
  }
  response.json({
    success: true,
    message: `Booking ${booking.bookingId} was deleted successfully.`,
    data: { id: booking._id, bookingId: booking.bookingId }
  });
}

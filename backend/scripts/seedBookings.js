import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDatabase } from '../config/db.js';
import Booking from '../models/Booking.js';

const samples = [
  ['Aarav Sharma', 'Satyanarayan Puja', 'Confirmed', 5100, '+91 90000 10001', -2],
  ['Meera Iyer', 'Griha Pravesh Puja', 'Pending', 11000, '+91 90000 10002', 3],
  ['Rohan Deshmukh', 'Ganesh Puja', 'In Progress', 3100, '+91 90000 10003', 0],
  ['Ananya Rao', 'Lakshmi Puja', 'Completed', 5100, '+91 90000 10004', -6],
  ['Vikram Patel', 'Rudrabhishek', 'Confirmed', 7100, '+91 90000 10005', 5],
  ['Ishita Banerjee', 'Durga Puja', 'Pending', 8100, '+91 90000 10006', 8],
  ['Kabir Nair', 'Navagraha Shanti', 'In Progress', 9100, '+91 90000 10007', -1],
  ['Saanvi Gupta', 'Satyanarayan Puja', 'Completed', 4100, '+91 90000 10008', -11],
  ['Aditya Kulkarni', 'Maha Mrityunjaya Jaap', 'Confirmed', 15000, '+91 90000 10009', 12],
  ['Diya Menon', 'Annaprashan Puja', 'Pending', 6100, '+91 90000 10010', 15],
  ['Arjun Reddy', 'Hanuman Puja', 'Completed', 2500, '+91 90000 10011', -3],
  ['Priya Chatterjee', 'Saraswati Puja', 'In Progress', 4500, '+91 90000 10012', 2],
  ['Dev Malhotra', 'Vastu Shanti Puja', 'Confirmed', 12500, '+91 90000 10013', 20],
  ['Nisha Joshi', 'Kaal Sarp Dosh Puja', 'Pending', 7100, '+91 90000 10014', 23],
  ['Rahul Verma', 'Rudrabhishek', 'Completed', 8100, '+91 90000 10015', -14],
  ['Tara Krishnan', 'Lakshmi Puja', 'In Progress', 5100, '+91 90000 10016', 6],
  ['Manav Shah', 'Griha Pravesh Puja', 'Confirmed', 11000, '+91 90000 10017', 28],
  ['Aditi Sinha', 'Ganesh Puja', 'Pending', 3100, '+91 90000 10018', 31]
];

try {
  await connectToDatabase();
  await Booking.init();
  const operations = samples.map(
    ([devoteeName, pujaName, status, amount, contactNumber, dayOffset], index) => {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      date.setHours(10 + (index % 8), 0, 0, 0);

      return {
        updateOne: {
          filter: { bookingId: `AS${1001 + index}` },
          update: {
            $setOnInsert: {
              bookingId: `AS${1001 + index}`,
              devoteeName,
              pujaName,
              date,
              amount,
              status,
              contactNumber,
              notes: index % 3 === 0 ? 'Please confirm the preferred muhurat with the devotee.' : ''
            }
          },
          upsert: true
        }
      };
    }
  );
  const result = await Booking.bulkWrite(operations, { ordered: true });
  await mongoose.connection.collection('bookingcounters').updateOne(
    { _id: 'bookingId' },
    { $max: { sequence: samples.length } },
    { upsert: true }
  );
  console.log(`Seed complete: ${result.upsertedCount} sample booking(s) inserted; existing samples were preserved.`);
} finally {
  await mongoose.disconnect();
}

import mongoose from 'mongoose';

export async function generateBookingId() {
  const counters = mongoose.connection.collection('bookingcounters');
  let counter;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const result = await counters.findOneAndUpdate(
        { _id: 'bookingId' },
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      counter = result && result.value ? result.value : result;
      break;
    } catch (error) {
      if (error.code !== 11000 || attempt === 4) {
        throw error;
      }
    }
  }

  if (!counter || typeof counter.sequence !== 'number') {
    throw new Error('Unable to allocate a booking ID.');
  }

  return `AS${1000 + counter.sequence}`;
}

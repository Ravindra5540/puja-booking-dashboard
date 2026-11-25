import 'dotenv/config';
import app from './app.js';
import { connectToDatabase } from './config/db.js';
import Booking from './models/Booking.js';

const port = Number(process.env.PORT) || 5000;

try {
  await connectToDatabase();
  await Booking.init();
  app.listen(port, () => {
    console.log(`API server listening on port ${port}.`);
  });
} catch (error) {
  console.error('Unable to start the API server:', error.message);
  process.exitCode = 1;
}

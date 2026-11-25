import cors from 'cors';
import express from 'express';
import bookingRoutes from './routes/bookingRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { notFoundMiddleware } from './middleware/notFoundMiddleware.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'Aaradhya Setu API is running.' });
});

app.use('/api/bookings', bookingRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

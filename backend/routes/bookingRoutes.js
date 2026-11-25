import { Router } from 'express';
import {
  createBooking,
  deleteBooking,
  getBooking,
  listBookings,
  updateBooking,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listBookings));
router.get('/:id', asyncHandler(getBooking));
router.post('/', asyncHandler(createBooking));
router.patch('/:id/status', asyncHandler(updateBookingStatus));
router.patch('/:id', asyncHandler(updateBooking));
router.delete('/:id', asyncHandler(deleteBooking));

export default router;

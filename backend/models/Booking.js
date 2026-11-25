import mongoose from 'mongoose';

const bookingStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed'];

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    devoteeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    pujaName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: bookingStatuses,
      default: 'Pending',
      required: true
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: 20,
      validate: {
        validator: (value) => {
          if (!value) {
            return true;
          }
          const digits = value.replace(/\D/g, '');
          return /^\+?[0-9\s()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
        },
        message: 'Contact number must contain 7 to 15 digits.'
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

bookingSchema.index({ date: -1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);

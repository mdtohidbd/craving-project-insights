import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  requests: { type: String, default: "" },
  bookingId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const Reservation = mongoose.model('Reservation', reservationSchema);

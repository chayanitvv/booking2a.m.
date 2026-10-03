const mongoose = require('mongoose');

const serviceBookingSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, index: true },
  customer: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  serviceType: { type: String, enum: ['stay', 'flight', 'car'], required: true, index: true },
  serviceName: { type: String, required: true },
  location: { type: String, required: true },
  serviceDetails: [{ type: String }],
  bookingDates: {
    checkIn: Date,
    checkOut: Date,
    pickupDate: Date,
    returnDate: Date
  },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'paid' },
  bookingStatus: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('ServiceBooking', serviceBookingSchema);

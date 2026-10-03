const ServiceBooking = require('../models/service-booking.model');

const createReference = () => `SJ${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
const isValidDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate > startDate;
};

const createServiceBooking = async (req, res, next) => {
  try {
    const { item, paymentMethod } = req.body;
    if (!item?.kind || !item?.name || !item?.place || !Number.isFinite(item.price) || !paymentMethod) {
      return res.status(400).json({ message: 'Booking and payment details are required' });
    }
    let bookingDates;
    if (item.kind === 'stay') {
      const { checkIn, checkOut } = item.bookingDates || {};
      if (!isValidDateRange(checkIn, checkOut)) {
        return res.status(400).json({ message: 'Check-out date must be after check-in date' });
      }
      bookingDates = { checkIn: new Date(checkIn), checkOut: new Date(checkOut) };
    } else if (item.kind === 'car') {
      const { pickupDate, returnDate } = item.bookingDates || {};
      if (!isValidDateRange(pickupDate, returnDate)) {
        return res.status(400).json({ message: 'Return date must be after pickup date' });
      }
      bookingDates = { pickupDate: new Date(pickupDate), returnDate: new Date(returnDate) };
    }
    const booking = await ServiceBooking.create({
      reference: createReference(),
      customer: { user: req.user._id, name: `${req.user.profile.firstName} ${req.user.profile.lastName}`, email: req.user.email, phone: req.user.profile.phone },
      serviceType: item.kind,
      serviceName: item.name,
      location: item.place,
      serviceDetails: item.details || [],
      bookingDates,
      totalAmount: item.price,
      paymentMethod,
      paymentStatus: paymentMethod === 'ชำระที่เคาน์เตอร์' ? 'pending' : 'paid',
      bookingStatus: paymentMethod === 'ชำระที่เคาน์เตอร์' ? 'pending' : 'confirmed'
    });
    res.status(201).json({ booking });
  } catch (error) { next(error); }
};

const listServiceBookings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type && ['stay', 'flight', 'car'].includes(req.query.type)) filter.serviceType = req.query.type;
    const bookings = await ServiceBooking.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ bookings });
  } catch (error) { next(error); }
};

module.exports = { createServiceBooking, listServiceBookings };

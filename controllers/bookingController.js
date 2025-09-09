const Booking = require("../models/Booking");
require("dotenv").config();

const addBooking = async (req, res) => {
  const userId = req.userId;

  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;

  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: userId,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
};

const getBookings = async (req, res) => {
  const userId = req.userId;

  try {
    const bookings = await Booking.find({ user: userId }).populate("place");

    if (!bookings.length) {
      return res.status(404).json({ error: "No bookings found for the user" });
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ error: err.message });
  }
};

const deleteBooking = async (req, res) => {
  const userId = req.userId;
  const bookingId = req.params.id;
  if (!bookingId) {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await Booking.deleteOne({ _id: bookingId });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "An error occurred while deleting the booking" });
  }
};

module.exports = { addBooking, getBookings, deleteBooking };

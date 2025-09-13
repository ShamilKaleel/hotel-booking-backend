const express = require("express");
const router = express.Router();
const {
  addBooking,
  getBookings,
  deleteBooking,
  getBookingsByPlace,
} = require("../controllers/bookingController");

const authMiddleware = require("../middleware/authMiddleware");
router.use(authMiddleware);

router.post("/bookings", addBooking);
router.get("/bookings", getBookings);
router.get("/bookings/place/:placeId", getBookingsByPlace);
router.delete("/bookings/:id", deleteBooking);

module.exports = router;

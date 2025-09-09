const express = require("express");
const router = express.Router();
const {
  addBooking,
  getBookings,
  deleteBooking,
} = require("../controllers/bookingController");

const authMiddleware = require("../middleware/authMiddleware");
router.use(authMiddleware);

router.post("/bookings", addBooking);
router.get("/bookings", getBookings);
router.delete("/bookings/:id", deleteBooking);

module.exports = router;

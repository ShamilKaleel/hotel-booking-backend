const express = require("express");
const cors = require("cors");
const Place = require("./models/Place.js");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

require("./config/db.js");


const UserRoute = require("./routes/userRoute");
const PlaceRoute = require("./routes/placeRoute");
const BookingRoute = require("./routes/bookingRoute");

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(
  cors({
    credentials: true,
    // origin: "https://stay-ease-theta.vercel.app",
    origin: process.env.ALL_CORS_ORIGINS,

  })
);

// Base URL health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Hi!", status: "Server is running", timestamp: new Date().toISOString() });
});

// API health check endpoint
app.get("/api", (req, res) => {
  res.json({ message: "Hi!", status: "API is working", timestamp: new Date().toISOString() });
});

app.use("/api", UserRoute);
app.use("/api", PlaceRoute);
app.use("/api", BookingRoute);

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

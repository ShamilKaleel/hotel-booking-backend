const express = require("express");
const cors = require("cors");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("./models/User.js");
const Place = require("./models/Place.js");
// const Booking = require("./models/Booking.js");
const cookieParser = require("cookie-parser");
//const imageDownloader = require("image-downloader");
//const multer = require("multer");
//const fs = require("fs");
//const { error } = require("console");
// // const mime = require("mime-types");

require("dotenv").config();
const app = express();

require("./config/db.js");
/*const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "fasefraw4r5r3wq45wdfgw34twdfg";
*/

const UserRoute = require("./routes/userRoute");
const PlaceRoute = require("./routes/placeRoute");
const BookingRoute = require("./routes/bookingRoute");
//const e = require("express");

// const bucket = "dawid-booking-app";

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
//app.use(express.urlencoded({ extended: true }));

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://stay-ease-theta.vercel.app",
//   "https://stay-ease-er4tzls2x-shamil-kaleels-projects.vercel.app",
//   "https://stay-ease-exd4mk6jz-shamil-kaleels-projects.vercel.app",
// ];

app.use(
  cors({
    credentials: true,
    // origin: "https://stay-ease-theta.vercel.app",
    origin: "http://localhost:5173",
  })
);

// app.get("/", async (req, res) => {
//   const allImgaes = [];
//   const places = await Place.find();
//   places.forEach((place) => {
//     place.photos.forEach((photo) => {
//       allImgaes.push(photo);
//     });
//   });
//   return res.json(allImgaes);
// });

app.use("/api", UserRoute);
app.use("/api", PlaceRoute);
app.use("/api", BookingRoute);

//mongoose.set("strictQuery", false);
//mongoose.connect(process.env.MONGO_URL);

/*const getUserDataFromReq = async (req) => {
  try {
    const userData = await new Promise((resolve, reject) => {
      jwt.verify(
        req.cookies.token,
        process.env.JWT_SECRET,
        {},
        (err, userData) => {
          if (err) {
            reject(err);
          } else {
            resolve(userData);
          }
        }
      );
    });
    return userData;
  } catch (err) {
    throw new Error(`Failed to get user data: ${err.message}`);
  }
};

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
        },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.status(422).json("not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id }).status(200);
    });
  } else {
    res.json(null).status(401);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").json(true).status(200);
});

app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: __dirname + "/uploads/" + newName,
  });

  res.json(newName);
});

const photosMiddleware = multer({ dest: "uploads" });
app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];
  // console.log(req.files);
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    // const parts = path.split(".");
    // const ext = parts[parts.length - 1];
    // const newPath = path + "." + ext;
    const newPath = path + ".jpg";
    const parts = newPath.split("\\");
    fs.renameSync(path, newPath);
    uploadedFiles.push(parts[1]);
    // uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
});

app.post("/places", (req, res) => {
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    price,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;
  if (!addedPhotos.length) {
    res.json("No photos").status(422);
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
    if (err) throw err;
    try {
      const placeDoc = await Place.create({
        owner: userData.id,
        price,
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
      });
      res.json(placeDoc).status(200);
    } catch (e) {
      res.json(e).status(422);
    }
  });
});

app.get("/user-places", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    res.json("no token").status(401);
    ret;
  }
  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
});

app.get("/places/:id", async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
});

app.put("/places", async (req, res) => {
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
});

app.get("/places", async (req, res) => {
  res.json(await Place.find());
});

app.delete("/places/:id", async (req, res) => {
  const { token } = req.cookies;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ error: "no token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
    if (err) return res.status(403).json({ error: "invalid token" });

    const placeDoc = await Place.findById(id);
    if (!placeDoc) {
      return res.status(404).json({ error: "Place not found" });
    }

    if (userData.id === placeDoc.owner.toString()) {
      await Place.deleteOne({ _id: id });
      res.json("Place deleted successfully").status(200);
    } else {
      res
        .status(403)
        .json({ error: "You are not authorized to delete this place" })
        .status(403);
    }
  });
});

app.post("/bookings", async (req, res) => {
  const userData = await getUserDataFromReq(req);
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
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);

    if (!userData || !userData.id) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    const bookings = await Booking.find({ user: userData.id }).populate(
      "place"
    );

    if (!bookings.length) {
      return res.status(404).json({ error: "No bookings found for the user" });
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/bookings/:id", async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const bookingId = req.params.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userData.id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await Booking.deleteOne({ _id: bookingId });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the booking" });
  }
});
*/
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log(
//         `Server is running on port & Connected to MongoDB ${process.env.PORT}`
//       );
//     });
//   })
//   .catch((error) => {
//     console.log("Error: ", error);
//   });
app.listen(process.env.PORTT || 4000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

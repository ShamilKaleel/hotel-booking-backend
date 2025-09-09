const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const photosMiddleware = multer({ storage: storage });
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  addPlace,
  getUserPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
  getPlaces,
  upload,
  uploadByLink,
  deleteImage,
} = require("../controllers/placeController");

router.get("/places", getPlaces);
router.get("/places/:id", getPlaceById);

router.post("/upload", photosMiddleware.array("photos", 20), upload);
router.post("/upload-by-link", uploadByLink);

router.post("/places", authMiddleware, addPlace);
router.get("/user-places", authMiddleware, getUserPlaces);
router.put("/places", authMiddleware, updatePlace);
router.delete("/places/:id", authMiddleware, deletePlace);
router.delete("/places/image/:file", authMiddleware, deleteImage);
module.exports = router;

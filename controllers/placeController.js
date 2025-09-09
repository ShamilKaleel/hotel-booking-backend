const Place = require("../models/Place");
const imageDownloader = require("image-downloader");
const fs = require("fs");
const mime = require("mime-types");
const path = require("path");
const crypto = require("crypto");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

//const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

//create a random file name for the image to be uploaded
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAMEE;
const region = process.env.AWS_BUCKET_REGIONN;
const accessKeyId = process.env.AWS_ACCESS_KEYY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEYY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const addPlace = async (req, res) => {
  const userId = req.userId;
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
  try {
    const placeDoc = await Place.create({
      owner: userId,
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
};

const getUserPlaces = async (req, res) => {
  const userId = req.userId;
  res.json(await Place.find({ owner: userId }));
};

const getPlaceById = async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
};

const updatePlace = async (req, res) => {
  const userId = req.userId;
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
  try {
    const placeDoc = await Place.findById(id);
    if (userId.toString() === placeDoc.owner.toString()) {
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
      res.status(200).json("ok");
    }
  } catch (e) {
    res.json(e).status(422);
  }
};

const deletePlace = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const placeDoc = await Place.findById(id);

    if (!placeDoc) {
      return res.status(404).json({ error: "Place not found" });
    }
    // console.log("userId - " + userId);
    // console.log("placeDoc.owner - " + placeDoc.owner.toString());

    if (!(userId.toString() === placeDoc.owner.toString())) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this place" });
    }
    if (!(placeDoc.photos.length === 0)) {
      for (let i = 0; i < placeDoc.photos.length; i++) {
        const part = placeDoc.photos[i].split(
          `https://${bucketName}.s3.amazonaws.com/`
        );
        const imageName = part[1];

        const deleteParams = {
          Bucket: bucketName,
          Key: imageName,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      }
    }

    await Place.deleteOne({ _id: id });
    res.json("Place deleted successfully").status(200);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const getPlaces = async (req, res) => {
  res.json(await Place.find());
};

const upload = async (req, res) => {
  const uploadedFiles = [];
  // console.log(req.files);
  for (let i = 0; i < req.files.length; i++) {
    const { buffer, mimetype } = req.files[i];
    const imageName = generateFileName() + ".jpg";

    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: mimetype,
      ACL: "public-read",
    };

    await s3Client.send(new PutObjectCommand(params));
    const url = `https://${bucketName}.s3.amazonaws.com/${imageName}`;
    uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
};

const uploadByLink = async (req, res) => {
  const { link } = req.body;
  const imageName = generateFileName() + ".jpg";
  const path = "/tmp/" + imageName;
  const mimetype = mime.lookup(path);
  try {
    await imageDownloader.image({
      url: link,
      dest: path,
    });
  } catch (e) {
    return res.status(400).json({ message: "Invalid link" });
  }

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: fs.readFileSync(path),
    ContentType: mimetype,
    ACL: "public-read",
  };

  await s3Client.send(new PutObjectCommand(params));
  const url = `https://${bucketName}.s3.amazonaws.com/${imageName}`;

  res.json(url);
};

const deleteImage = async (req, res) => {
  const { file } = req.params;

  const deleteParams = {
    Bucket: bucketName,
    Key: file,
  };
  await s3Client.send(new DeleteObjectCommand(deleteParams));
  res.status(200).json("ok");
};
module.exports = {
  addPlace,
  getUserPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
  getPlaces,
  upload,
  uploadByLink,
  deleteImage,
};

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configuration for SnapifyPost folder
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "SnapifyPost",
    allowedFormats: ["png", "jpg", "jpeg"],
    transformation: [{ width: 350, crop: "fill", quality: "90" }],
  },
});

// Configuration for SnapifyDP folder
const dpStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "SnapifyDP",
    allowedFormats: ["png", "jpg", "jpeg"],
    transformation: [
      {
        width: 350,
        height: 350,
        crop: "thumb",
        gravity: "face",
        quality: "auto",
      },
    ],
  },
});

module.exports = { cloudinary, postStorage, dpStorage };

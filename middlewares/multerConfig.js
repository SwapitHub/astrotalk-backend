const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = file.originalname.split('.')[0];
    return {
      folder: 'uploads',
      public_id: `${originalName}-${Date.now()}`, // optional: unique with timestamp
      resource_type: 'image',
      format: file.mimetype.split("/")[1],
    };
  },
});

const upload = multer({ storage });
module.exports = upload;

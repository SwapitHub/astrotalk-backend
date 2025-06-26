const mongoose = require("mongoose");

const AddGallerySchema = new mongoose.Schema({
  nameAstro: String,
  mobileNumber: String,
  multipleImages: [
    {
      img_url: String,
      cloudinary_id: String,
    },
  ],
});

const AddGallery = mongoose.model("AddGallery", AddGallerySchema);
module.exports = AddGallery;

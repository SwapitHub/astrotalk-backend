const mongoose = require("mongoose");

const AddHomeBannerSchema = new mongoose.Schema({
  banner_heading: String,
  banner_desc: String,
  banner_btn_link: String,
  banner_btn_name: String,
  singleImages: {
    img_url: String,
    cloudinary_id: String,
  },
});

const AddHomeBanner = mongoose.model("AddHomeBanner", AddHomeBannerSchema);
module.exports = AddHomeBanner;

const cloudinary = require("../config/cloudinary");
const AddHomeBanner = require("../models/HomeBannerModel");

const getHomeBanner = async (re, res) => {
  try {
    const homeBanner = await AddHomeBanner.find();
    res.json(homeBanner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteHomeBanner = async (req, res) => {
  try {
    const { cloudinary_id } = req.query;

    if (!cloudinary_id) {
      return res.status(400).json({ message: "cloudinary_id is required" });
    }

    const banner = await AddHomeBanner.findOne({
      "singleImages.cloudinary_id": cloudinary_id,
    });

    if (!banner) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(cloudinary_id);

    // Delete the banner document
    await AddHomeBanner.findByIdAndDelete(banner._id);

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const postHomeBanner = async (req, res) => {
  try {
    const { banner_heading, banner_desc,banner_btn_name, banner_btn_link } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image = {
      img_url: req.file.path,
      cloudinary_id: req.file.filename,
    };

    const banner = new AddHomeBanner({
      banner_heading,
      banner_desc,
      banner_btn_name,
      banner_btn_link,
      singleImages: image,
    });

    await banner.save();

    res.status(200).json({
      message: "success",
      data: banner,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  deleteHomeBanner,
  postHomeBanner,
  getHomeBanner,
};

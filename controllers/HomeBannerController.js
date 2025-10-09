const fs = require("fs");
const path = require("path");
const AddHomeBanner = require("../models/HomeBannerModel");

// Get all home banners
const getHomeBanner = async (req, res) => {
  try {
    const homeBanner = await AddHomeBanner.find();
    res.json(homeBanner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete home banner and its image file
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

    // Delete local image file
    const filePath = path.join(__dirname, "..", "public", "uploads", cloudinary_id);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the banner document
    await AddHomeBanner.findByIdAndDelete(banner._id);

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update home banner and replace old image
const putHomeBanner = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const banner = await AddHomeBanner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const {
      banner_heading,
      banner_desc,
      banner_btn_name,
      banner_btn_link,
    } = req.body;

    if (banner_heading) banner.banner_heading = banner_heading;
    if (banner_desc) banner.banner_desc = banner_desc;
    if (banner_btn_name) banner.banner_btn_name = banner_btn_name;
    if (banner_btn_link) banner.banner_btn_link = banner_btn_link;

    // If new image uploaded
    if (req.file) {
      // Delete old image from /public/uploads/
      const oldImage = banner.singleImages?.cloudinary_id;
      if (oldImage) {
        const oldFilePath = path.join(__dirname, "..", "public", "uploads", oldImage);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Set new image info
      const image = {
        img_url: `/public/uploads/${req.file.filename}`,
        cloudinary_id: req.file.filename,
      };
      banner.singleImages = image;
    }

    await banner.save();

    res.status(200).json({
      message: "Banner updated successfully",
      data: banner,
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add new home banner
const postHomeBanner = async (req, res) => {
  try {
    const { banner_heading, banner_desc, banner_btn_name, banner_btn_link } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image = {
      img_url: `/public/uploads/${req.file.filename}`,
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
      message: "Banner created successfully",
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
  putHomeBanner,
};

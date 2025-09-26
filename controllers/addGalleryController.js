const AddGallery = require("../models/addGalleryModel");
const cloudinary = require("../config/cloudinary");


const getDetailGalleryByAstroOrMobile = async (req, res) => {
    
  try {
    const { nameAstro, mobileNumber } = req.query;

    if (!nameAstro && !mobileNumber) {
      return res.status(400).json({ message: "Provide either nameAstro or mobileNumber" });
    }

    const query = [];

    if (nameAstro) {
      query.push({ nameAstro: nameAstro });
    }
    if (mobileNumber) {
      query.push({ mobileNumber: mobileNumber });
    }

    const galleryData = await AddGallery.find({ $or: query });

    if (!galleryData.length) {
      return res.status(404).json({ message: "No gallery data found for the given inputs" });
    }

    res.json(galleryData);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error while retrieving gallery" });
  }
};


const deleteGalleryAstrologer = async (req, res) => {
  try {
    const { cloudinary_id } = req.query;

    if (!cloudinary_id) {
      return res.status(400).json({ message: "cloudinary_id is required" });
    }

    const gallery = await AddGallery.findOne({ "multipleImages.cloudinary_id": cloudinary_id });

    if (!gallery) {
      return res.status(404).json({ message: "Image not found" });
    }

    await cloudinary.uploader.destroy(cloudinary_id);

    gallery.multipleImages = gallery.multipleImages.filter(
      (img) => img.cloudinary_id !== cloudinary_id
    );

    await gallery.save();

    res.status(200).json({ message: "Image deleted successfully", data: gallery });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const postGalleryAstrologer = async (req, res) => {
  try {
    const files = [
      ...(req.files?.multipleImages || []),
      ...(req.files?.singleImage || []),
    ];

    if (!files.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const newImages = files.map((file) => ({
      img_url: `/public/uploads/${file.filename}`,
      cloudinary_id: file.filename,
    }));

    const { nameAstro, mobileNumber } = req.body;

    // Optional: Check if gallery for this astrologer already exists
    let gallery = await AddGallery.findOne({ mobileNumber });

    if (gallery) {
      gallery.multipleImages.push(...newImages);
      await gallery.save();
    } else {
      gallery = new AddGallery({
        nameAstro,
        mobileNumber,
        multipleImages: newImages,
      });
      await gallery.save();
    }   

    res.status(200).json({ message: "success", data: gallery });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




module.exports = {
    getDetailGalleryByAstroOrMobile,
    deleteGalleryAstrologer,
    postGalleryAstrologer
}
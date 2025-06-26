const AddGallery = require("../models/addGalleryModel");
const cloudinary = require("../config/cloudinary");


const getGalleryAstrologer = async (req, res)=>{
 try{
    const getGallery = await AddGallery.find();
    res.json(getGallery);
 }
 catch(err){
    res.status(500).json({message: err.message || "gallery data not found"})
 }
}

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
      img_url: file.path,
      cloudinary_id: file.filename,
    }));

    // Step 1: Check if any gallery exists (you can customize this with user ID or astrologer ID)
    let gallery = await AddGallery.findOne();

    if (gallery) {
      // Step 2: If exists, push to existing gallery
      gallery.multipleImages.push(...newImages);
      await gallery.save();
    } else {
      // Step 3: If not, create new gallery
      gallery = new AddGallery({ multipleImages: newImages });
      await gallery.save();
    }

    res.status(200).json({
      message: "success",
      data: gallery,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



module.exports = {
    getGalleryAstrologer,
    deleteGalleryAstrologer,
    postGalleryAstrologer
}
const astroMallShopListing = require("../models/astroMallShopListingModel");


const getAstroShopeList = async (req, res) => {
  try {
    const shopItems = await astroMallShopListing.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({
      message: "success",
      data: shopItems,
    });
  } catch (error) {
    console.error("Error fetching astro shop list:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const postAstroShopeList = async (req, res) => {

  try {
    const { offer_title, offer_name, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const astroMallImg = req.file.path; 
    const cloudinary_id = req.file.filename; 

    const newItem = new astroMallShopListing({
      offer_title,
      offer_name,
      description,
      astroMallImg,
      cloudinary_id
    });

    const saved = await newItem.save();

    return res.status(201).json({ message: "Saved successfully", data: saved });
  } catch (err) {
    console.error("Upload failed:", err);
    return res.status(500).json({ error: "Internal Server Error", detail: err });
  }
};

module.exports = { postAstroShopeList, getAstroShopeList };

const astroMallProductListing = require("../models/astroMallShopProductModel");

const getAstroShopeProductByShopId = async (req, res) => {
  try {
    const { shop_id } = req.params;

    if (!shop_id) {
      return res.status(400).json({ message: "Shop ID is required" });
    }

    const productItems = await astroMallProductListing
      .find({ shop_id })
      .sort({ createdAt: -1 });

    if (!productItems || productItems.length === 0) {
      return res.status(404).json({ message: "No products found for this shop" });
    }

    res.status(200).json({
      message: "success",
      data: productItems,
    });
  } catch (error) {
    console.error("Error fetching products by shop_id:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const postAstroShopeProduct = async (req, res) => {
  try {
    const { offer_name, description, name, slug, shop_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const existingItem = await astroMallProductListing.findOne({ slug: slug });
    if (existingItem) {
      return res.status(409).json({
        message: "Slug already exists. Please choose a different one.",
      });
    }

    const astroMallProductImg = req.file.path;
    const cloudinary_id = req.file.filename;

    const newItem = new astroMallProductListing({
      name,
      slug,
      shop_id,
      offer_name,
      description,
      astroMallProductImg,
      cloudinary_id,
    });

    const saved = await newItem.save();

    return res.status(201).json({ message: "Saved successfully", data: saved });
  } catch (err) {
    console.error("Upload failed:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", detail: err });
  }
};

module.exports = { postAstroShopeProduct,getAstroShopeProductByShopId };

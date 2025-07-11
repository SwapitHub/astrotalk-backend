const astroMallShopListing = require("../models/astroMallShopListingModel");
const cloudinary = require("../config/cloudinary");

const getAstroShopeDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    const shop = await astroMallShopListing.findOne({ slug });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({
      message: "success",
      data: shop,
    });
  } catch (error) {
    console.error("Error fetching shop detail:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteAstroShope = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find the shop
    const product = await astroMallShopListing.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 2: Delete image from Cloudinary
    if (product.cloudinary_id) {
      await cloudinary.uploader.destroy(product.cloudinary_id);
    }

    // Step 3: Delete shop from MongoDB
    await astroMallShopListing.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "shop and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateAstroShopeList = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      offer_title,
      offer_name,
      description,
      name,
      slug,
      Jewelry_product_gem,
      discount_product,
    } = req.body;

    const shop = await astroMallShopListing.findById(id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // If new image uploaded, delete old one and set new
    let updatedImagePath = shop.astroMallImg;
    let updatedCloudinaryId = shop.cloudinary_id;

    if (req.file) {
      // Delete old image from Cloudinary
      if (shop.cloudinary_id) {
        await cloudinary.uploader.destroy(shop.cloudinary_id);
      }

      // Set new image values
      updatedImagePath = req.file.path;
      updatedCloudinaryId = req.file.filename;
    }

    // Update fields
    const updatedShop = await astroMallShopListing.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        offer_title,
        offer_name,
        description,
        Jewelry_product_gem,
        discount_product,
        astroMallImg: updatedImagePath,
        cloudinary_id: updatedCloudinaryId,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Shop updated successfully", data: updatedShop });
  } catch (err) {
    console.error("Update failed:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message,
    });
  }
};

const getAstroShopeListBasedServices = async (req, res) => {
  try {
    const shopItems = await astroMallShopListing.find({
      Jewelry_product_gem: false,
      discount_product: false,
    }).sort({ createdAt: -1 }); // latest first

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
    const {
      offer_title,
      offer_name,
      description,
      name,
      slug,
      discount_product,
      Jewelry_product_gem,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const existingItem = await astroMallShopListing.findOne({ slug: slug });
    if (existingItem) {
      return res.status(409).json({
        message: "Slug already exists. Please choose a different one.",
      });
    }

    const astroMallImg = req.file.path;
    const cloudinary_id = req.file.filename;

    const newItem = new astroMallShopListing({
      name,
      slug,
      offer_title,
      offer_name,
      discount_product,
      description,
      astroMallImg,
      cloudinary_id,
      Jewelry_product_gem,
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

module.exports = {
  postAstroShopeList,
  getAstroShopeList,
  getAstroShopeDetail,
  deleteAstroShope,
  updateAstroShopeList,
  getAstroShopeListBasedServices
};

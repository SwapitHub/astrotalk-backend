const fs = require("fs");
const path = require("path");
const astroMallShopListing = require("../models/astroMallShopListingModel");
const mongoose = require("mongoose");

// ✅ Utility: Delete image from local storage
const deleteLocalImage = (imgPath) => {
  try {
    const fullPath = path.join(__dirname, "..", imgPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("Failed to delete image:", err.message);
  }
};

const getAstroShopeDetail = async (req, res) => {
  try {
    const { identifier } = req.params;

    let query = {};

    // Check if identifier is a valid Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const shop = await astroMallShopListing.findOne(query);

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

    const product = await astroMallShopListing.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.astroMallImg) {
      deleteLocalImage(product.astroMallImg);
    }

    await astroMallShopListing.findByIdAndDelete(id);

    return res.status(200).json({ message: "Shop and image deleted successfully" });
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
      detail_shop_information,
    } = req.body;

    const shop = await astroMallShopListing.findById(id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

  let updatedImagePath = shop.astroMallImg;

    // ✅ Handle new image upload
    if (req.file) {
      if (shop.astroMallImg) {
        deleteLocalImage(shop.astroMallImg); // delete old image
      }
      updatedImagePath = `/public/uploads/${req.file.filename}`;
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
        detail_shop_information,
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
    const shopItems = await astroMallShopListing
      .find({
        Jewelry_product_gem: false,
        discount_product: false,
      })
      .sort({ createdAt: -1 }); // latest first

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
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};

    if (search) {
      query.offer_name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const shopItems = await astroMallShopListing
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await astroMallShopListing.countDocuments(query);

    res.status(200).json({
      message: "success",
      data: shopItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
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
      detail_shop_information,
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

    const astroMallImg = `/public/uploads/${req.file.filename}`;
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
      detail_shop_information,
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
  getAstroShopeListBasedServices,
};

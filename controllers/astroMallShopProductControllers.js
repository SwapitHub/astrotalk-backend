const astroMallProductListing = require("../models/astroMallShopProductModel");
const cloudinary = require("../config/cloudinary");

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
      return res
        .status(404)
        .json({ message: "No products found for this shop" });
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

const deleteAstroShopeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find the product
    const product = await astroMallProductListing.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 2: Delete image from Cloudinary
    if (product.cloudinary_id) {
      await cloudinary.uploader.destroy(product.cloudinary_id);
    }

    // Step 3: Delete product from MongoDB
    await astroMallProductListing.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Product and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateAstroShopeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      shop_id,
      offer_name,
      starting_price,
      actual_price,
      discount_price,
      description,
      top_selling,
    } = req.body;

    // Step 1: Find existing product
    const existingProduct = await astroMallProductListing.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 2: If new image uploaded, delete old image and upload new one
    let updatedImagePath = existingProduct.astroMallProductImg;
    let updatedCloudinaryId = existingProduct.cloudinary_id;

    if (req.file) {
      // Delete old image from cloudinary
      if (existingProduct.cloudinary_id) {
        await cloudinary.uploader.destroy(existingProduct.cloudinary_id);
      }

      // Save new image details
      updatedImagePath = req.file.path;
      updatedCloudinaryId = req.file.filename;
    }

    // Step 3: Update the product
    const updatedProduct = await astroMallProductListing.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        shop_id,
        offer_name,
        starting_price: starting_price || null,
        actual_price: actual_price || null,
        discount_price: discount_price || null,
        astroMallProductImg: updatedImagePath,
        cloudinary_id: updatedCloudinaryId,
        description,
        top_selling: top_selling || false,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update failed:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

const getAstroProductListTopSelling = async (req, res) => {
  try {
    const topSellingProducts = await astroMallProductListing.find({
      top_selling: true,
    });

    res.status(200).json({
      success: true,
      data: topSellingProducts,
    });
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAstroProductDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Product slug is required" });
    }

    const productItem = await astroMallProductListing.findOne({ slug });

    if (!productItem) {
      return res
        .status(404)
        .json({ message: "No product found for this slug" });
    }

    res.status(200).json({
      message: "Success",
      data: productItem,
    });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




const getAstroShopeProduct = async (req, res) => {
  try {
    const productItems = await astroMallProductListing
      .find()
      .sort({ createdAt: -1 }); // latest first
    res.status(200).json({
      message: "success",
      data: productItems,
    });
  } catch (error) {
    console.error("Error fetching astro product list:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const postAstroShopeProduct = async (req, res) => {
  try {
    const {
      offer_name,
      starting_price,
      actual_price,
      discount_price,
      name,
      slug,
      shop_id,
      description,
      top_selling,
    } = req.body;

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
      starting_price: starting_price || null,
      actual_price: actual_price || null,
      discount_price: discount_price || null,
      astroMallProductImg,
      cloudinary_id,
      description,
      top_selling: top_selling || false,
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
  getAstroShopeProduct,
  postAstroShopeProduct,
  getAstroShopeProductByShopId,
  deleteAstroShopeProduct,
  updateAstroShopeProduct,
  getAstroProductDetail,
  getAstroProductListTopSelling,
};

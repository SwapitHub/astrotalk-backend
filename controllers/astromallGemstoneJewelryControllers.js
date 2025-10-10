const astroMallGemJewelryListing = require("../models/astromallGemstoneJewelryModel");
const fs = require("fs");
const path = require("path");

// const getAstroShopeProductByShopId = async (req, res) => {
//   try {
//     const { shop_id } = req.params;

//     if (!shop_id) {
//       return res.status(400).json({ message: "Shop ID is required" });
//     }

//     const productItems = await astroMallGemJewelryListing
//       .find({ shop_id })
//       .sort({ createdAt: -1 });

//     if (!productItems || productItems.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No products found for this shop" });
//     }

//     res.status(200).json({
//       message: "success",
//       data: productItems,
//     });
//   } catch (error) {
//     console.error("Error fetching products by shop_id:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

const deleteAstroShopeGemstoneJewelry = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find the product
    const product = await astroMallGemJewelryListing.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 2: Soft delete by updating flag only (no image deletion)
    product.deleteGemJewelry = true;
    await product.save();

    return res.status(200).json({
      message: "Gemstone jewelry soft deleted successfully",
    });
  } catch (error) {
    console.error("Error soft deleting product:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const updateAstroShopeGemstoneJewelry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, actual_price, productType } = req.body;

    const existingProduct = await astroMallGemJewelryListing.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedImagePath = existingProduct.astroGemstoneJewelryImg;
    let updatedCloudinaryId = existingProduct.cloudinary_id;

    if (req.file) {
      if (existingProduct.astroGemstoneJewelryImg) {
        // Remove leading /public or adjust path depending on how you save it
        const oldImageRelativePath =
          existingProduct.astroGemstoneJewelryImg.startsWith("/public")
            ? existingProduct.astroGemstoneJewelryImg.replace("/public", "")
            : existingProduct.astroGemstoneJewelryImg;

        // Build full path on disk
        const oldImageFullPath = path.join(
          __dirname,
          "../public",
          oldImageRelativePath
        );

        // Delete file if exists
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      }

      updatedImagePath = `/public/uploads/${req.file.filename}`;
      updatedCloudinaryId = req.file.filename;
    }

    const updatedProduct = await astroMallGemJewelryListing.findByIdAndUpdate(
      id,
      {
        name,
        actual_price,
        productType,
        astroGemstoneJewelryImg: updatedImagePath, // ✅ correct
        cloudinary_id: updatedCloudinaryId,
        deleteGemJewelry: false
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Gem Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update failed:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

const getAstroShopeGemstoneJewelryDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Product slug is required" });
    }

    const productItem = await astroMallGemJewelryListing.findOne({ slug });

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

const getAstroShopeGemstoneJewelry = async (req, res) => {
  try {
    const productItems = await astroMallGemJewelryListing
      .find({ deleteGemJewelry: false }) // Only non-deleted items
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "success",
      data: productItems,
    });
  } catch (error) {
    console.error("Error fetching astro gemStone product list:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const postAstroShopeGemstoneJewelry = async (req, res) => {
  try {
    const { name, actual_price, productType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const astroGemstoneJewelryImg = `/public/uploads/${req.file.filename}`;
    const cloudinary_id = req.file.filename;

    const newItem = new astroMallGemJewelryListing({
      name,
      actual_price,
      astroGemstoneJewelryImg,
      cloudinary_id,
      productType,
      deleteGemJewelry: false
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
  getAstroShopeGemstoneJewelry,
  getAstroShopeGemstoneJewelryDetail,
  deleteAstroShopeGemstoneJewelry,
  updateAstroShopeGemstoneJewelry,
  postAstroShopeGemstoneJewelry,
};

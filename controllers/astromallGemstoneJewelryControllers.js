const cloudinary = require("../config/cloudinary");
const astroMallGemJewelryListing = require("../models/astromallGemstoneJewelryModel");

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

    // Step 2: Delete image from Cloudinary
    if (product.cloudinary_id) {
      await cloudinary.uploader.destroy(product.cloudinary_id);
    }

    // Step 3: Delete product from MongoDB
    await astroMallGemJewelryListing.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Gem Product and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateAstroShopeGemstoneJewelry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, actual_price } = req.body;

    const existingProduct = await astroMallGemJewelryListing.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedImagePath = existingProduct.astroGemstoneJewelryImg;
    let updatedCloudinaryId = existingProduct.cloudinary_id;

    if (req.file) {
      if (existingProduct.cloudinary_id) {
        await cloudinary.uploader.destroy(existingProduct.cloudinary_id);
      }

      updatedImagePath = req.file.path;
      updatedCloudinaryId = req.file.filename;
    }

    const updatedProduct = await astroMallGemJewelryListing.findByIdAndUpdate(
      id,
      {
        name,
        actual_price,
        astroGemstoneJewelryImg: updatedImagePath, // ✅ correct
        cloudinary_id: updatedCloudinaryId,
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
      .find()
      .sort({ createdAt: -1 }); // latest first
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
    const { name, actual_price } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    

    const astroGemstoneJewelryImg = req.file.path;
    const cloudinary_id = req.file.filename;

    const newItem = new astroMallGemJewelryListing({
      name,
      actual_price,
      astroGemstoneJewelryImg,
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

module.exports = {
  getAstroShopeGemstoneJewelry,
  getAstroShopeGemstoneJewelryDetail,
  deleteAstroShopeGemstoneJewelry,
  updateAstroShopeGemstoneJewelry,
  postAstroShopeGemstoneJewelry,
};

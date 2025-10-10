const fs = require("fs");
const path = require("path");

const astroMallProductListing = require("../models/astroMallShopProductModel");
const cloudinary = require("../config/cloudinary");


const getAstroShopeProductByShopId = async (req, res) => {
  try {
    const { shop_id } = req.params;
    const { search } = req.query;

    if (!shop_id) {
      return res.status(400).json({ message: "Shop ID is required" });
    }

    // Base query
    const query = { shop_id };

    // Optional name filter
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const productItems = await astroMallProductListing
      .find(query)
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

    // Step 2: Update the deleteShopProductStatus flag to true (soft delete)
    product.deleteShopProductStatus = true;
    await product.save();

    return res.status(200).json({ message: "Product soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting product:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const deleteSingleAstroProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    // Step 1: Find the product containing the image
    const product = await astroMallProductListing.findOne({
      "images._id": imageId,
    });

    if (!product) {
      return res.status(404).json({ message: "Image not found in any product" });
    }

    // Step 2: Find the exact image object
    const imageToDelete = product.images.find(
      (img) => img._id.toString() === imageId
    );

    if (!imageToDelete) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Step 3: Delete the image file from local storage
    if (imageToDelete.url) {
      const imagePath = path.join(__dirname, `../${imageToDelete.url}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Step 4: Remove the image from the images array in DB
    await astroMallProductListing.updateOne(
      { _id: product._id },
      { $pull: { images: { _id: imageId } } }
    );

    return res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting image by ID:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const updateAnyFieldShopProduct = async (req, res) => {
  const productId = req.params.productId; // use productId here
  const updateData = req.body;

  try {
    const updatedProduct = await astroMallProductListing.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
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
      shop_slug,
      offer_name,
      starting_price,
      actual_price,
      discount_price,
      description,
      top_selling,
      newlyLaunched,
      detail_information,
      shop_product_type,
      meta_description,
      meta_title,
      meta_keyword,
    } = req.body;

    // 1. Find the existing product
    const existingProduct = await astroMallProductListing.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

        // 2. Handle main image update
    let updatedMainImage = existingProduct.astroMallProductImg;

    if (
      req.files &&
      req.files["astroMallProductImg"] &&
      req.files["astroMallProductImg"].length > 0
    ) {
      const newMainImg = req.files["astroMallProductImg"][0];

      // Delete old main image
      if (existingProduct.astroMallProductImg) {
        const oldImgPath = path.join(
          __dirname,
          `../${existingProduct.astroMallProductImg}`
        );
        if (fs.existsSync(oldImgPath)) {
          fs.unlinkSync(oldImgPath);
        }
      }

      updatedMainImage = `/public/uploads/${newMainImg.filename}`;
    }

    // 3. Handle gallery image updates (append mode)
    let updatedImages = [...existingProduct.images];

    if (
      req.files &&
      req.files["astroMallImages"] &&
      req.files["astroMallImages"].length > 0
    ) {
      const newImages = req.files["astroMallImages"].map((file) => ({
        url: `/public/uploads/${file.filename}`,
      }));

      updatedImages = [...updatedImages, ...newImages];
    }

    // 4. Perform the update
    const updatedProduct = await astroMallProductListing.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        shop_id,
        shop_slug,
        offer_name,
        starting_price: starting_price || null,
        actual_price: actual_price || null,
        discount_price: discount_price || null,
        astroMallProductImg: updatedMainImage,
        images: updatedImages,
        description,
        top_selling: top_selling === "true" || top_selling === true,
        newlyLaunched: newlyLaunched === "true" || newlyLaunched === true,
        detail_information,
        shop_product_type,
        meta_description,
        meta_title,
        meta_keyword,
        deleteShopProductStatus:false,
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

const getAstroProductListNewlyLaunched = async (req, res) => {
  try {
    const topSellingProducts = await astroMallProductListing.find({
      newlyLaunched: true,
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
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      deleteShopProductStatus: false,
    };

    if (search) {
      query.offer_name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const productItems = await astroMallProductListing
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await astroMallProductListing.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      message: "success",
      data: productItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount: totalCount,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching astro product list:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAstroShopProductSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query parameter is required." });
    }

    const matchingProducts = await astroMallProductListing
      .find({
        name: { $regex: query, $options: "i" },
      })
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json({
      message: "success",
      data: matchingProducts,
    });
  } catch (error) {
    console.error("Error fetching product suggestions:", error);
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
      shop_slug,
      description,
      top_selling,
      newlyLaunched,
      detail_information,
      shop_product_type,
      meta_description,
      meta_title,
      meta_keyword,
    } = req.body;

    if (
      !req.files ||
      !req.files["astroMallProductImg"] ||
      req.files["astroMallProductImg"].length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Main product image is required." });
    }
    if (
      !req.files["astroMallImages"] ||
      req.files["astroMallImages"].length === 0
    ) {
      return res
        .status(400)
        .json({ message: "At least one gallery image is required." });
    }

    const existingItem = await astroMallProductListing.findOne({ slug: slug });
    if (existingItem) {
      return res.status(409).json({
        message: "Slug already exists. Please choose a different one.",
      });
    }

    // Main image path
    const mainImageFile = req.files["astroMallProductImg"][0];
    const astroMallProductImg = `/public/uploads/${mainImageFile.filename}`;

    // Map gallery images
    const images = req.files["astroMallImages"].map((file) => ({
      url: `/public/uploads/${file.filename}`,
    }));

    const newItem = new astroMallProductListing({
      name,
      slug,
      shop_id,
      shop_slug,
      offer_name,
      starting_price: starting_price || null,
      actual_price: actual_price || null,
      discount_price: discount_price || null,
      astroMallProductImg,
      images,
      description,
      top_selling: top_selling || false,
      newlyLaunched: newlyLaunched || false,
      detail_information,
      shop_product_type,
      meta_description,
      meta_title,
      meta_keyword,
      deleteShopProductStatus:false,
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
  updateAnyFieldShopProduct,
  getAstroProductListNewlyLaunched,
  getAstroShopProductSuggestions,
  deleteSingleAstroProductImage,
};

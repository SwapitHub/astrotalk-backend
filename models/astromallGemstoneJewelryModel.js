const { default: mongoose } = require("mongoose");

const astroMallGemJewelrySchema = new mongoose.Schema({
  name: String,
  astroGemstoneJewelryImg: String,
  actual_price: String,
  cloudinary_id: String,
  productType: String,
  deleteGemJewelry: Boolean,
});

const astroMallGemJewelryListing = mongoose.model(
  "astroMallGemJewelryListing",
  astroMallGemJewelrySchema
);
module.exports = astroMallGemJewelryListing;

const { default: mongoose } = require("mongoose");

const astroMallProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  shop_id: String,
  astroMallProductImg: String,
  offer_name: String,
  starting_price: String,
  actual_price: String,
  discount_price: String,
  description: String,
  cloudinary_id: String,
  
});

const astroMallProductListing = mongoose.model(
  "astroMallProductListing",
  astroMallProductSchema
);
module.exports = astroMallProductListing;

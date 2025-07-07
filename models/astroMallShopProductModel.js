const { default: mongoose } = require("mongoose");

const astroMallProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  shop_id: String,
  astroMallProductImg: String,
  offer_name: String,
  description: String,
  cloudinary_id: String,
});

const astroMallProductListing = mongoose.model(
  "astroMallProductListing",
  astroMallProductSchema
);
module.exports = astroMallProductListing;

const { default: mongoose } = require("mongoose");

const astroMallShopSchema = new mongoose.Schema({
  name: String,
  slug: String,
  offer_title: String,
  astroMallImg: String,
  offer_name: String,
  discount_product: Boolean,
  Jewelry_product_gem: Boolean,
  description: String,
  cloudinary_id: String,
  detail_shop_information: String,
  deleteShopStatus: Boolean,
});

const astroMallShopListing = mongoose.model(
  "astroMallShopListing",
  astroMallShopSchema
);
module.exports = astroMallShopListing;

const { default: mongoose } = require("mongoose");

const astroMallProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    shop_id: String,
    shop_slug: String,
    astroMallProductImg: String,
    offer_name: String,
    starting_price: String,
    actual_price: String,
    discount_price: String,
    shop_product_type: String,
    description: String,
    cloudinary_id: String,
    top_selling: Boolean,
    newlyLaunched: Boolean,
    ring_size: String,
    gemStone_product_price: String,
    product_type_gem: String,
    detail_information: String,
    meta_description: String,
    meta_title: String,
    meta_keyword: String,
    deleteShopProductStatus:Boolean,
    images: [
      {
        url: String,
        cloudinary_id: String,
      },
    ],
  },
  { timestamps: true }
);

const astroMallProductListing = mongoose.model(
  "astroMallProductListing",
  astroMallProductSchema
);
module.exports = astroMallProductListing;

const express = require("express");

const upload = require("../middlewares/multerConfig");
const {
  postAstroShopeProduct,
  getAstroShopeProductByShopId,
} = require("../controllers/astroMallShopProductControllers");

const astroShopProduct = express.Router();

astroShopProduct.get(
  "/get-astro-shope-product-shop-id/:shop_id",
  getAstroShopeProductByShopId
);

astroShopProduct.post(
  "/post-astro-shope-product",
  upload.single("astroMallProductImg"),
  postAstroShopeProduct
);

module.exports = { astroShopProduct };

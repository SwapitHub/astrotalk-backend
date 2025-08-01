const express = require("express");

const upload = require("../middlewares/multerConfig");
const {
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
} = require("../controllers/astroMallShopProductControllers");

const astroShopProduct = express.Router();

astroShopProduct.get("/get-astro-shope-product", getAstroShopeProduct);

astroShopProduct.get(
  "/get-astro-shope-product-suggestions",
  getAstroShopProductSuggestions
);

astroShopProduct.get("/get-astro-product-detail/:slug", getAstroProductDetail);

astroShopProduct.get(
  "/get-astro-product-list-top-selling/:top_selling",
  getAstroProductListTopSelling
);

astroShopProduct.get(
  "/get-astro-product-list-newly-launched/:newlyLaunched",
  getAstroProductListNewlyLaunched
);

astroShopProduct.delete(
  "/delete-astro-product-single-image/:imageId",
  deleteSingleAstroProductImage
);

astroShopProduct.delete(
  "/delete-astro-shope-product/:id",
  deleteAstroShopeProduct
);

astroShopProduct.put(
  "/update-astro-shope-product/:id",
  upload.fields([
    { name: "astroMallProductImg", maxCount: 1 },
    { name: "astroMallImages", maxCount: 10 },
  ]),
  updateAstroShopeProduct
);


astroShopProduct.put(
  "/update-any-field-astro-shope-product/:productId",
  updateAnyFieldShopProduct
);

astroShopProduct.get(
  "/get-astro-shope-product-shop-id/:shop_id",
  getAstroShopeProductByShopId
);

astroShopProduct.post(
  "/post-astro-shope-product",
  upload.fields([
    { name: "astroMallProductImg", maxCount: 1 }, // single file expected
    { name: "astroMallImages", maxCount: 10 }, // multiple files allowed
  ]),
  postAstroShopeProduct
);

module.exports = { astroShopProduct };

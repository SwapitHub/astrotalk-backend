const express = require("express");

const upload = require("../middlewares/multerConfig");
const { getAstroShopeProduct, postAstroShopeProduct, getAstroShopeProductByShopId, deleteAstroShopeProduct, updateAstroShopeProduct, getAstroProductDetail, getAstroProductListTopSelling, updateAnyFieldShopProduct } = require("../controllers/astroMallShopProductControllers");

const astroShopProduct = express.Router();

astroShopProduct.get("/get-astro-shope-product", getAstroShopeProduct)

astroShopProduct.get("/get-astro-product-detail/:slug", getAstroProductDetail)

astroShopProduct.get("/get-astro-product-list-top-selling/:top_selling", getAstroProductListTopSelling)

astroShopProduct.delete("/delete-astro-shope-product/:id", deleteAstroShopeProduct)

astroShopProduct.put("/update-astro-shope-product/:id", upload.single("astroMallProductImg"), updateAstroShopeProduct);

astroShopProduct.put("/update-any-field-astro-shope-product/:productId", updateAnyFieldShopProduct);

astroShopProduct.get("/get-astro-shope-product-shop-id/:shop_id", getAstroShopeProductByShopId)

astroShopProduct.post("/post-astro-shope-product", upload.single("astroMallProductImg"), postAstroShopeProduct)

module.exports = {astroShopProduct}


const express = require("express");

const upload = require("../middlewares/multerConfig");
const { getAstroShopeProduct, postAstroShopeProduct, getAstroShopeProductByShopId, deleteAstroShopeProduct, updateAstroShopeProduct, getAstroProductDetail } = require("../controllers/astroMallShopProductControllers");

const astroShopProduct = express.Router();

astroShopProduct.get("/get-astro-shope-product", getAstroShopeProduct)

astroShopProduct.get("/get-astro-product-detail/:slug", getAstroProductDetail)

astroShopProduct.delete("/delete-astro-shope-product/:id", deleteAstroShopeProduct)

astroShopProduct.put("/update-astro-shope-product/:id", upload.single("astroMallProductImg"), updateAstroShopeProduct);

astroShopProduct.get("/get-astro-shope-product-shop-id/:shop_id", getAstroShopeProductByShopId)

astroShopProduct.post("/post-astro-shope-product", upload.single("astroMallProductImg"), postAstroShopeProduct)

module.exports = {astroShopProduct}


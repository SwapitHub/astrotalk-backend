const express = require("express");

const upload = require("../middlewares/multerConfig");
const { getAstroShopeGemstoneJewelry, getAstroShopeGemstoneJewelryDetail, deleteAstroShopeGemstoneJewelry, updateAstroShopeGemstoneJewelry, postAstroShopeGemstoneJewelry } = require("../controllers/astromallGemstoneJewelryControllers");


const astroGemJewelry = express.Router();

astroGemJewelry.get("/get-astro-gemstone-jewelry", getAstroShopeGemstoneJewelry)

astroGemJewelry.get("/get-astro-gemstone-jewelry-detail/:slug", getAstroShopeGemstoneJewelryDetail)

astroGemJewelry.delete("/delete-astro-gemstone-jewelry/:id", deleteAstroShopeGemstoneJewelry)

astroGemJewelry.put("/update-astro-gemstone-jewelry/:id", upload.single("astroGemstoneJewelryImg"), updateAstroShopeGemstoneJewelry);

// astroGemJewelry.get("/get-astro-gemstone-jewelry-shop-id/:shop_id", getAstroShopeGemstoneJewelryByShopId)

astroGemJewelry.post("/post-astro-gemstone-jewelry", upload.single("astroGemstoneJewelryImg"), postAstroShopeGemstoneJewelry)

module.exports = {astroGemJewelry}


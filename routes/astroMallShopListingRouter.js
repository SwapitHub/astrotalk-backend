const express = require("express");
const { postAstroShopeList, getAstroShopeList, getAstroShopeDetail } = require("../controllers/astroMallShopListingController");

const upload = require("../middlewares/multerConfig");
const astroShopList = express.Router();

astroShopList.get("/get-astro-shope-list", getAstroShopeList)
astroShopList.get("/get-astro-shope-detail/:slug", getAstroShopeDetail)

astroShopList.post("/astro-shope-list", upload.single("astroMallImg"), postAstroShopeList)

module.exports = {astroShopList}


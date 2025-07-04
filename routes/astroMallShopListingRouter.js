const express = require("express");
const { postAstroShopeList, getAstroShopeList } = require("../controllers/astroMallShopListingController");

const upload = require("../middlewares/multerConfig");
const astroShopList = express.Router();

astroShopList.get("/get-astro-shope-list", getAstroShopeList)

astroShopList.post("/astro-shope-list", upload.single("astroMallImg"), postAstroShopeList)

module.exports = {astroShopList}


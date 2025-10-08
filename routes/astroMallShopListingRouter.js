const express = require("express");
const {
  postAstroShopeList,
  getAstroShopeList,
  getAstroShopeDetail,
  deleteAstroShope,
  updateAstroShopeList,
  getAstroShopeListBasedServices,
} = require("../controllers/astroMallShopListingController");

const upload = require("../middlewares/multerConfig");
const astroShopList = express.Router();

astroShopList.get("/get-astro-shope-list", getAstroShopeList);

astroShopList.get(
  "/get-astro-shope-list-services",
  getAstroShopeListBasedServices
);

astroShopList.get("/get-astro-shope-detail/:identifier", getAstroShopeDetail);

astroShopList.delete("/delete-astro-shope/:id", deleteAstroShope);

astroShopList.put(
  "/update-astro-shope/:id",
  upload.single("astroMallImg"),
  updateAstroShopeList
);

astroShopList.post(
  "/astro-shope-list",
  upload.single("astroMallImg"),
  postAstroShopeList
);

module.exports = { astroShopList };

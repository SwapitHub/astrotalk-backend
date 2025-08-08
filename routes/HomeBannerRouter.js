const express = require("express");
const upload = require("../middlewares/multerConfig");
const { getHomeBanner, postHomeBanner, deleteHomeBanner } = require("../controllers/HomeBannerController");
const HomeBannerRouter = express.Router();


HomeBannerRouter.get("/get-banner-home",getHomeBanner);

HomeBannerRouter.post(
  "/post-banner-home",
  upload.single("image"),
  postHomeBanner
);

// DELETE one banner by image cloudinary ID
HomeBannerRouter.delete(
  "/delete-bannerHome",
  deleteHomeBanner
);



module.exports = HomeBannerRouter;
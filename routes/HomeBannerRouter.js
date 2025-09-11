const express = require("express");
const upload = require("../middlewares/multerConfig");
const { getHomeBanner, postHomeBanner, deleteHomeBanner, putHomeBanner } = require("../controllers/HomeBannerController");
const HomeBannerRouter = express.Router();


HomeBannerRouter.get("/get-banner-home",getHomeBanner);

HomeBannerRouter.post(
  "/post-banner-home",
  upload.single("image"),
  postHomeBanner
);

HomeBannerRouter.put(
  "/put-banner-home",
  upload.single("image"), 
  putHomeBanner
);


// DELETE one banner by image cloudinary ID
HomeBannerRouter.delete(
  "/delete-bannerHome",
  deleteHomeBanner
);



module.exports = HomeBannerRouter;
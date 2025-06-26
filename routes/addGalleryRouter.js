const express = require("express");
const { getGalleryAstrologer, deleteGalleryAstrologer, postGalleryAstrologer, getGalleryByAstroOrMobile } = require("../controllers/addGalleryController");
const upload = require("../middlewares/multerConfig");
const addGalleryRoute = express.Router();


addGalleryRoute.get("/get-gallery-astrologer",getGalleryByAstroOrMobile);

addGalleryRoute.delete("/delete-gallery-astrologer", deleteGalleryAstrologer);

addGalleryRoute.post("/post-gallery-astrologer", upload.fields([
    { name: "multipleImages", maxCount: 10 },
  ]),
  postGalleryAstrologer
);


module.exports = addGalleryRoute;
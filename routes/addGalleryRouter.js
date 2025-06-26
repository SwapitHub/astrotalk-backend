const express = require("express");
const { getGalleryAstrologer, deleteGalleryAstrologer, postGalleryAstrologer } = require("../controllers/addGalleryController");
const upload = require("../middlewares/multerConfig");
const addGalleryRoute = express.Router();


addGalleryRoute.get("/get-gallery-astrologer",getGalleryAstrologer);

// Route
addGalleryRoute.delete("/delete-gallery-astrologer", deleteGalleryAstrologer);


// addGalleryRoute.delete("/delete-gallery-astrologer/:cloudinary_id", deleteGalleryAstrologer
// );


addGalleryRoute.post("/post-gallery-astrologer", upload.fields([
    { name: "multipleImages", maxCount: 10 },
  ]),
  postGalleryAstrologer
);


module.exports = addGalleryRoute;
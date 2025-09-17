const express = require("express");
const {
  getAstrologerProfile,
  getAstrologerProfileRating,
  getAstrologerProfileFilters,
  putAstrologerProfile,
  putAstrologerProfileUpdate,
  putAstrologerBusesProfileUpdate,
  postAstrologerProfile,
  putUpdateService,
  getAstrologersServicesByShopId,
} = require("../controllers/businessProfileAstrologerControllers");
const businessProfileRoute = express.Router();

const upload = require("../middlewares/multerConfig");

businessProfileRoute.put("/update-spiritual-service", putUpdateService);

businessProfileRoute.get(
  "/astrologer-list-spiritual-service/:shopId",
  getAstrologersServicesByShopId
);
businessProfileRoute.get(
  "/astrologer-businessProfile/free-chat-true",
  getAstrologerProfile
);
businessProfileRoute.get(
  "/astrologer-businessProfile-detail/:query",
  getAstrologerProfileRating
);
businessProfileRoute.get(
  "/astrologer-businessProfile",
  getAstrologerProfileFilters
);
businessProfileRoute.put(
  "/update-astro-status-by-mobile/:mobileNumber",
  putAstrologerProfile
);
businessProfileRoute.put(
  "/astrologer-businessProfile-update/:mobileNumber",
  upload.single("image"),
  putAstrologerProfileUpdate
);
businessProfileRoute.put(
  "/update-business-profile/:mobileNumber",
  upload.single("image"),
  putAstrologerBusesProfileUpdate
);
businessProfileRoute.post(
  "/astrologer-businessProfile",
  upload.single("image"),
  postAstrologerProfile
);

module.exports = { businessProfileRoute };

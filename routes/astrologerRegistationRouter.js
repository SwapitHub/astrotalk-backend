const express = require("express");

const astrologerRoutes = express.Router();

const {
  getAstrologerList,
  updateAstroStatus,
  getAstrologerDetail,
  registerAstrologer,
  deleteAstrologerList,
} = require("../controllers/astrologerController");

const upload = require("../middlewares/multerConfig");

astrologerRoutes.get("/astrologer-list", getAstrologerList);

astrologerRoutes.delete(
  "/delete-astrologer-list/:mobileNumber",
  deleteAstrologerList
);

astrologerRoutes.get("/astrologer-detail/:mobileNumber", getAstrologerDetail);

astrologerRoutes.post(
  "/astrologer-registration",
  upload.fields([
    { name: "aadhaarCard", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  registerAstrologer
);

astrologerRoutes.put("/update-astro-status/:id", updateAstroStatus);

module.exports = { astrologerRoutes };

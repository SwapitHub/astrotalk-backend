const express = require("express");


const astrologerRoutes = express.Router();

const {
  getAstrologerList,
  updateAstroStatus,
  getAstrologerDetail,
  registerAstrologer,
} = require("../controllers/astrologerController");


astrologerRoutes.get("/astrologer-list", getAstrologerList);
astrologerRoutes.get("/astrologer-detail/:mobileNumber", getAstrologerDetail);
astrologerRoutes.post("/astrologer-registration", registerAstrologer);
astrologerRoutes.put("/update-astro-status/:id", updateAstroStatus);



module.exports = { astrologerRoutes };

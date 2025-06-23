const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getAstrologerProfile, getAstrologerProfileRating, getAstrologerProfileFilters, putAstrologerProfile, putAstrologerProfileUpdate, putAstrologerBusesProfileUpdate, postAstrologerProfile } = require("../controllers/businessProfileAstrologerControllers");
const businessProfileRoute = express.Router();


// multer for image upload start here
// businessProfileRoute.use(
//   "/images",
//   express.static(path.join(__dirname, "../public/images"))
// );
const uploadDir = path.join(process.cwd(), "uploads");

// ✅ Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Serve images
businessProfileRoute.use("/uploads", express.static(uploadDir));

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext;
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${originalName}${extension}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

businessProfileRoute.get("/uploads-test", (req, res) => {
  res.json({ path: uploadDir });
});

// multer for image upload End here


businessProfileRoute.get("/astrologer-businessProfile/free-chat-true",getAstrologerProfile);
businessProfileRoute.get("/astrologer-businessProfile/:query", getAstrologerProfileRating);
businessProfileRoute.get("/astrologer-businessProfile", getAstrologerProfileFilters);
businessProfileRoute.put("/update-astro-status-by-mobile/:mobileNumber", putAstrologerProfile);
businessProfileRoute.put("/astrologer-businessProfile-update/:mobileNumber", upload.single("image"),
  putAstrologerProfileUpdate
);
businessProfileRoute.put("/update-business-profile/:mobileNumber", upload.single("image"),
putAstrologerBusesProfileUpdate
);
businessProfileRoute.post("/astrologer-businessProfile",upload.single("image"),
 postAstrologerProfile
);

module.exports = { businessProfileRoute };

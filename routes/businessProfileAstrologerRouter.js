const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const businessProfileAstrologer = require("../models/businessProfileAstrologerModel");
const businessProfileRoute = express.Router();

// multer for image upload start here
// businessProfileRoute.use(
//   "/images",
//   express.static(path.join(__dirname, "../public/images"))
// );
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
businessProfileRoute.use("/uploads", express.static(uploadPath));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName}${extension}`;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// multer for image upload End here

businessProfileRoute.get(
  "/astrologer-businessProfile/:query",
  async (req, res) => {
    try {
      const { query } = req.params;

      let businessProfile;

      const isObjectId = /^[0-9a-fA-F]{24}$/.test(query);

      if (isObjectId) {
        businessProfile = await businessProfileAstrologer.findById(query);
      } else {
        businessProfile = await businessProfileAstrologer.findOne({
          mobileNumber: query,
        });
      }

      if (!businessProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }

      res.json(businessProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business profile" });
    }
  }
);

businessProfileRoute.get("/astrologer-businessProfile", async (req, res) => {
  try {
    const businessProfile = await businessProfileAstrologer.find();
    res.json(businessProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update API
businessProfileRoute.put(
  "/update-astro-status-by-mobile/:mobileNumber",
  async (req, res, next) => {
    try {
      const { mobileNumber } = req.params;
      const { profileStatus, chatStatus } = req.body;

      if (profileStatus === undefined && chatStatus === undefined) {
        return res
          .status(400)
          .json({ error: "profileStatus or chatStatus is required" });
      }

      let updateFields = {};

      if (profileStatus !== undefined) {
        updateFields.profileStatus =
          profileStatus === true || profileStatus === "true";
      }

      if (chatStatus !== undefined) {
        updateFields.chatStatus = chatStatus === true || chatStatus === "true";
      }

      const updatedProfile = await businessProfileAstrologer.findOneAndUpdate(
        { mobileNumber },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({ error: "Astrologer not found" });
      }

      res.status(200).json({
        message: "Success",
        updatedProfile: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

businessProfileRoute.post(
  "/astrologer-businessProfile",
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        profession,
        languages,
        experience,
        charges,
        Description,
        mobileNumber,
        profileStatus,
        chatStatus,
      } = req.body;

      if (
        !name || !profession || !languages || !experience || !charges || !Description ||
        !mobileNumber || !req.file || profileStatus === undefined || chatStatus === undefined
      ) {
        return res.status(400).json({ error: "All fields including the image are required" });
      }

      const imageName = `${process.env.API_BASE_URL}/uploads/${req.file.filename}`;

      const newBusinessProfile = new businessProfileAstrologer({
        name,
        profession,
        languages,
        experience,
        charges,
        Description,
        mobileNumber,
        profileImage: imageName,
        profileStatus,
        chatStatus,
      });

      await newBusinessProfile.save();

      res.status(201).json({
        message: "success",
        BusinessProfileData: newBusinessProfile,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to add businessProfile" });
    }
  }
);


module.exports = { businessProfileRoute };

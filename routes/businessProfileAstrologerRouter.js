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
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName}${extension}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

businessProfileRoute.get("/uploads-test", (req, res) => {
  res.json({ path: uploadDir });
});

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

// update status API
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


// update all field API astrologer profile
businessProfileRoute.put(
  "/astrologer-businessProfile-update/:mobileNumber",
  upload.single("image"),
  async (req, res) => {
    try {
      const { mobileNumber: oldMobileNumber } = req.params;
      const {
        name,
        profession,
        languages,
        experience,
        charges,
        Description,
        profileStatus,
        chatStatus,
        mobileNumber: newMobileNumber, // For update (optional)
      } = req.body;

      const updateData = {
        name,
        profession,
        languages,
        experience,
        charges,
        Description,
        profileStatus,
        chatStatus,
      };

      // Only include image if uploaded
      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      // Only update mobileNumber if a new one is provided
      if (newMobileNumber) {
        updateData.mobileNumber = newMobileNumber;
      }

      const updatedProfile = await businessProfileAstrologer.findOneAndUpdate(
        { mobileNumber: oldMobileNumber },
        { $set: updateData },
        { new: true }
      );

      if (!updatedProfile) {
        return res
          .status(404)
          .json({ error: "Astrologer profile not found for update" });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        updatedProfile,
      });
    } catch (error) {
      console.error("Update failed:", error);
      res.status(500).json({ error: "Failed to update astrologer profile" });
    }
  }
);


businessProfileRoute.post(
  "/astrologer-businessProfile",
  upload.single("image"),
  async (req, res) => {

    console.log("req.bodys",req.body);
    
    try {
      const {
        name,
        professions,
        languages,
        experience,
        charges,
        Description,
        mobileNumber,
        profileStatus,
        chatStatus,
      } = req.body;


      // Parse JSON strings if sent that way
      const parsedLanguages = typeof languages === "string" ? JSON.parse(languages) : languages;
      const parsedProfessions = typeof professions === "string" ? JSON.parse(professions) : professions;

      // Validation
      if (
        !name ||
        !parsedProfessions?.length ||
        !parsedLanguages?.length ||
        !experience ||
        !charges ||
        !Description ||
        !mobileNumber ||
        !req.file ||
        profileStatus === undefined ||
        chatStatus === undefined
      ) {
        return res
          .status(400)
          .json({ error: "All fields including the image are required" });
      }

      // Construct the full image URL
      const imageURL = `/uploads/${req.file.filename}`;

      const newBusinessProfile = new businessProfileAstrologer({
        name,
        professions: parsedProfessions,
        languages: parsedLanguages,
        experience,
        charges,
        Description,
        mobileNumber,
        profileImage: imageURL,
        profileStatus,
        chatStatus,
      });

      await newBusinessProfile.save();

      res.status(201).json({
        message: "success",
        BusinessProfileData: newBusinessProfile,
      });
    } catch (error) {
      console.error("Error uploading business profile:", error);
      res.status(500).json({ error: "Failed to add businessProfile" });
    }
  }
);


module.exports = { businessProfileRoute };

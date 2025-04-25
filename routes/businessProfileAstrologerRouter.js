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
        // First try to find by mobileNumber
        businessProfile = await businessProfileAstrologer.findOne({
          mobileNumber: query,
        });

        // If not found by mobileNumber, try to find by name (case-insensitive)
        if (!businessProfile) {
          businessProfile = await businessProfileAstrologer.findOne({
            name: { $regex: new RegExp(`^${query}$`, "i") },
          });
        }
      }

      if (!businessProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }

      res.json(businessProfile);
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ error: "Failed to fetch business profile" });
    }
  }
);


businessProfileRoute.get("/astrologer-businessProfile", async (req, res) => {
  try {
    const {
      languages,
      professions,
      gender,
      country,
      name,
      sortby,
      page = 1,
      limit = 10,
    } = req.query;

    // 🔍 Step 1: Build filter object
    const filter = {};

    if (languages) {
      filter.languages = { $in: languages.split(",") };
    }

    if (professions) {
      filter.professions = { $in: professions.split(",") };
    }

    if (gender) {
      filter.gender = { $in: gender.split(",") };
    }

    if (country) {
      filter.country = { $in: country.split(",") };
    }

    if (name) {
      filter.name = { $regex: new RegExp(name, "i") }; // Case-insensitive search
    }

    // 🔃 Step 2: Build sort object
    let sort = {};

    switch (sortby) {
      case "charges_high_to_low":
        sort.charges = -1;
        break;
      case "charges_low_to_high":
        sort.charges = 1;
        break;
      case "experience_high_to_low":
        sort.experience = -1;
        break;
      case "experience_low_to_high":
        sort.experience = 1;
        break;
    }

    // 🔄 Step 3: Pagination calculations
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 📄 Step 4: Query with filter, sort, and pagination
    const total = await businessProfileAstrologer.countDocuments(filter);
    const profiles = await businessProfileAstrologer
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ Step 5: Respond
    res.json({
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      profiles,
    });
  } catch (err) {
    console.error(err);
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
      const { mobileNumber } = req.params;

      const {
        name,
        professions,
        languages,
        experience,
        charges,
        Description,   
        country,
        gender,           
      } = req.body;

      // Parse if needed (in case frontend sends them as strings)
      const parsedLanguages = typeof languages === "string" ? JSON.parse(languages) : languages;
      const parsedProfessions = typeof professions === "string" ? JSON.parse(professions) : professions;

      // Validation (only for required fields you want in updates — relax if partial updates are allowed)
      if (
        !name ||
        !parsedProfessions?.length ||
        !parsedLanguages?.length ||
        !experience ||
        !charges ||
        !Description ||
        !country ||
        !gender
    
      ) {
        return res.status(400).json({ error: "All fields are required except mobileNumber" });
      }

      // Prepare update data
      const updateData = {
        name,
        professions: parsedProfessions,
        languages: parsedLanguages,
        experience,
        charges,
        Description,
        country,
        gender,        
      };

      // Handle optional image upload
      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedProfile = await businessProfileAstrologer.findOneAndUpdate(
        { mobileNumber },
        { $set: updateData },
        { new: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({ error: "Astrologer profile not found" });
      }

      res.status(200).json({
        message: "success",
        updatedProfile,
      });
    } catch (error) {
      console.error("Profile update failed:", error);
      res.status(500).json({ error: "Failed to update business profile" });
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
        country,
        gender,
        starRating,
        orders,
        offers
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
        chatStatus === undefined ||
        !country ||
        !gender
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
        country,
        gender,
        starRating,
        orders,
        offers
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

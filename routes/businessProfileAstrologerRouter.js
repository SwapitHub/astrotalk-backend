const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const businessProfileAstrologer = require("../models/businessProfileAstrologerModel");
const ratingModel = require("../models/ratingModel");
const orderModel = require("../models/orderModel");
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

businessProfileRoute.get(
  "/astrologer-businessProfile/free-chat-true",
  async (req, res) => {
    try {
      const freeChatAstrologers = await businessProfileAstrologer.find({
        freeChatStatus: true,
      });

      // Just send back empty array if no data found
      res.status(200).json({
        message: "success",
        data: freeChatAstrologers,
      });
    } catch (error) {
      console.error("Error fetching free chat astrologers:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

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

        if (!businessProfile) {
          businessProfile = await businessProfileAstrologer.findOne({
            name: { $regex: new RegExp(`^${query}$`, "i") },
          });
        }
      }

      if (!businessProfile) {
        return res.status(404).json({ error: "Business profile not found" });
      }

      // ⭐ Fetch Ratings
      const ratings = await ratingModel.find({
        astrologerId: businessProfile._id,
      });
      const average =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length || 0;

      const formattedRatings = ratings.map((r) => ({
        rating: r.rating,
        userName: r.userName || "Anonymous",
        review: r.review || "",
        date: r.createdAt,
      }));

      // 📦 Fetch Orders
      const orders = await orderModel.find({
        astrologerId: businessProfile._id,
      });
      const totalOrderCount = orders.reduce(
        (sum, o) => sum + (o.order || 0),
        0
      );

      // ✅ Response
      res.json({
        ...businessProfile.toObject(),
        averageRating: average.toFixed(2),
        totalReviews: ratings.length,
        totalOrders: totalOrderCount,
        reviews: formattedRatings,
      });
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
      freeChatStatus,
      minAverageRating,
    } = req.query;
    console.log("minAverageRating", minAverageRating);

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

    if (freeChatStatus !== undefined) {
      filter.freeChatStatus = freeChatStatus === "true"; // 🔥 Correct: convert "true" or "false" string to real boolean
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

    // 🌟 Step 5: Attach average rating and total reviews
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const ratings = await ratingModel.find({ astrologerId: profile._id });
        const average =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length || 0;

        const formattedRatings = ratings.map((r) => ({
          rating: r.rating,
          userName: r.userName || "Anonymous",
          review: r.review || "",
          date: r.createdAt,
        }));

        // 🔢 Get total order count
        const orders = await orderModel.find({ astrologerId: profile._id });
        const totalOrderCount = orders.reduce(
          (sum, o) => sum + (o.order || 0),
          0
        );

        return {
          ...profile.toObject(),
          averageRating: average.toFixed(2),
          totalReviews: ratings.length,
          totalOrders: totalOrderCount,
          reviews: formattedRatings,
          numericAverage: average, // used for filtering
        };
      })
    );

    // Filter by average rating (after enrichment)

    let finalProfiles = enrichedProfiles;

if (minAverageRating) {
  const categories = minAverageRating.split(",");

  finalProfiles = enrichedProfiles.filter((p) => {
    return categories.some((category) => {
      switch (category) {
        case "rising_star":
          return p.numericAverage >= 4.5 && p.experience < 10;
        case "celebrity":
          return p.numericAverage >= 4.6;
        case "top_choice":
          return p.numericAverage >= 4.7;
        case "All":
          return true; 
        default:
          return false;
      }
    });
  });
}


    // ✅ Step 5: Respond
    res.json({
      total: finalProfiles.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(finalProfiles.length / limit),
      profiles: finalProfiles,
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
      const { profileStatus, chatStatus, requestStatus } = req.body;

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
      if (requestStatus !== undefined) {
        updateFields.requestStatus =
          requestStatus === true || requestStatus === "true";
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
      const parsedLanguages =
        typeof languages === "string" ? JSON.parse(languages) : languages;
      const parsedProfessions =
        typeof professions === "string" ? JSON.parse(professions) : professions;

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
        return res
          .status(400)
          .json({ error: "All fields are required except mobileNumber" });
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

businessProfileRoute.put(
  "/update-business-profile/:mobileNumber",
  upload.single("image"),
  async (req, res) => {
    try {
      const { mobileNumber } = req.params;
      const updateFields = req.body;

      if (!mobileNumber) {
        return res.status(400).json({ error: "Mobile number is required" });
      }

      // Handle professions and languages if frontend sends them as JSON strings
      if (
        updateFields.languages &&
        typeof updateFields.languages === "string"
      ) {
        updateFields.languages = JSON.parse(updateFields.languages);
      }
      if (
        updateFields.professions &&
        typeof updateFields.professions === "string"
      ) {
        updateFields.professions = JSON.parse(updateFields.professions);
      }

      // Handle profile image if uploaded
      if (req.file) {
        updateFields.profileImage = `/uploads/${req.file.filename}`;
      }

      // Check if updateFields has at least one field
      if (!Object.keys(updateFields).length) {
        return res
          .status(400)
          .json({ error: "At least one field must be provided to update" });
      }

      // Find and update astrologer's profile
      const updatedProfile = await businessProfileAstrologer.findOneAndUpdate(
        { mobileNumber },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({ error: "Astrologer profile not found" });
      }

      res.status(200).json({
        message: "Success",
        updatedProfile,
      });
    } catch (error) {
      console.error("Error updating business profile:", error);
      return res.status(500).json({
        error: "Failed to update business profile",
        details: error.message,
      });
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
        offers,
        freeChatStatus,
        requestStatus,
      } = req.body;

      // Parse JSON strings if sent that way
      const parsedLanguages =
        typeof languages === "string" ? JSON.parse(languages) : languages;
      const parsedProfessions =
        typeof professions === "string" ? JSON.parse(professions) : professions;

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
        offers,
        freeChatStatus,
        requestStatus,
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

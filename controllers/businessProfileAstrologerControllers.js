const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const businessProfileAstrologer = require("../models/businessProfileAstrologerModel");
const ratingModel = require("../models/ratingModel");
const orderModel = require("../models/orderModel");
const cloudinary = require("../config/cloudinary");

const getAstrologerProfile = async (req, res) => {
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
};

const putUpdateService = async (req, res) => {
  const { mobileNumber, spiritual_services } = req.body;

  if (!mobileNumber || !Array.isArray(spiritual_services)) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const astrologer = await businessProfileAstrologer.findOne({
      mobileNumber,
    });

    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found." });
    }

    // Replace spiritual_services with new list
    astrologer.spiritual_services = spiritual_services;
    await astrologer.save();

    return res.status(200).json({ message: "Services updated successfully." });
  } catch (err) {
    console.error("Bulk update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAstrologersServicesByShopId = async (req, res) => {
  const { shopId } = req.params;

  if (!shopId) {
    return res.status(400).json({ message: "Shop ID is required." });
  }

  try {
    // Match astrologers where any spiritual_service has matching shop_id
    const astrologers = await businessProfileAstrologer.find({
      "spiritual_services.shop_id": shopId,
    });

    res.status(200).json({
      message: "success",
      data: astrologers,
    });
  } catch (error) {
    console.error("Error fetching astrologers by shop ID:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAstrologerProfileRating = async (req, res) => {
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

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatingSum = 0;

    ratings.forEach((r) => {
      const val = r.rating;
      if (ratingCounts[val] !== undefined) {
        ratingCounts[val] += 1;
      }
      totalRatingSum += val;
    });

    const totalRatings = ratings.length;
    const average = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

    const averageRatings = {
      averageRating_1: ratingCounts[1] ? (1).toFixed(2) : "0.00",
      averageRating_2: ratingCounts[2] ? (2).toFixed(2) : "0.00",
      averageRating_3: ratingCounts[3] ? (3).toFixed(2) : "0.00",
      averageRating_4: ratingCounts[4] ? (4).toFixed(2) : "0.00",
      averageRating_5: ratingCounts[5] ? (5).toFixed(2) : "0.00",
    };

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
    const totalOrderCount = orders.reduce((sum, o) => sum + (o.order || 0), 0);

    // ✅ Final Response
    res.json({
      ...businessProfile.toObject(),
      ...averageRatings,
      totalRating_1: ratingCounts[1],
      totalRating_2: ratingCounts[2],
      totalRating_3: ratingCounts[3],
      totalRating_4: ratingCounts[4],
      totalRating_5: ratingCounts[5],
      averageRating: average.toFixed(2),
      totalReviews: totalRatings,
      totalOrders: totalOrderCount,
      reviews: formattedRatings,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch business profile" });
  }
};

const getAstrologerProfileFilters = async (req, res) => {
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
      profileStatus,
    } = req.query;

    // 🔍 Step 1: Build filter object
    const filter = {};

    if (profileStatus !== undefined) {
      filter.profileStatus = profileStatus == "true";
    }

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
      filter.name = { $regex: new RegExp(name, "i") };
    }

    if (freeChatStatus !== undefined) {
      filter.freeChatStatus = freeChatStatus === "true";
    }

    // 🔄 Step 2: Fetch unsorted, paginated data
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalDocs = await businessProfileAstrologer.countDocuments(filter);

    let profiles = await businessProfileAstrologer
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    // 🌟 Step 5: Attach average rating and total reviews

    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const ratings = await ratingModel.find({ astrologerId: profile._id });

        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalRatingSum = 0;
        ratings.forEach((r) => {
          if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
          totalRatingSum += r.rating;
        });

        const totalRatings = ratings.length;
        const average = totalRatings > 0 ? totalRatingSum / totalRatings : 0;
        const numericAverage = average;
        const experience = parseFloat(profile.experience || "0");
        const totalOrders = await orderModel.countDocuments({
          astrologerId: profile._id,
        });
        // 🔍 Determine topAstrologer tag
        let topAstrologer = "";
        if (numericAverage >= 4.5 && experience < 10) {
          topAstrologer = "rising_star";
        } else if (numericAverage >= 4.7 && totalOrders >= 10) {
          topAstrologer = "top_choice";
        } else if (numericAverage >= 4.6 && experience > 10) {
          topAstrologer = "celebrity";
        }

        // Optionally: save this back to DB
        profile.topAstrologer = topAstrologer;
        await profile.save();

        return {
          ...profile.toObject(),
          topAstrologer, // include in response
          averageRating: average.toFixed(2),
          numericAverage,
          totalReviews: totalRatings,
          totalOrders: await orderModel.countDocuments({
            astrologerId: profile._id,
          }),
          totalRating_1: ratingCounts[1],
          totalRating_2: ratingCounts[2],
          totalRating_3: ratingCounts[3],
          totalRating_4: ratingCounts[4],
          totalRating_5: ratingCounts[5],
          reviews: ratings.map((r) => ({
            rating: r.rating,
            userName: r.userName || "Anonymous",
            review: r.review || "",
            date: r.createdAt,
          })),
        };
      })
    );

    // Filter by average rating (after enrichment)

    let finalProfiles = enrichedProfiles;

    if (minAverageRating) {
      const categories = minAverageRating.split(",");

      finalProfiles = enrichedProfiles.filter((p) => {
        return categories.some((category) => {
          if (category === "rising_star") {
            return p.numericAverage >= 4.5 && p.experience < 10;
          } else if (category === "top_choice") {
            return p.numericAverage >= 4.7 && p.totalOrders >= 10;
          } else if (category === "celebrity") {
            return p.numericAverage >= 4.6 && p.experience > 10;
          } else if (category === "All") {
            return true;
          } else {
            return false;
          }
        });
      });
    }

    // 🔃 Step 3: Convert and sort in JS
    if (sortby) {
      finalProfiles = finalProfiles.sort((a, b) => {
        const expA = parseFloat(a.experience) || 0;
        const expB = parseFloat(b.experience) || 0;
        const chargesA = parseFloat(a.charges) || 0;
        const chargesB = parseFloat(b.charges) || 0;
        const ordersA = parseFloat(a.totalOrders) || 0;
        const ordersB = parseFloat(b.totalOrders) || 0;

        switch (sortby.toLowerCase()) {
          case "experience_high_to_low":
            return expB - expA;
          case "experience_low_to_high":
            return expA - expB;
          case "charges_high_to_low":
            return chargesB - chargesA;
          case "charges_low_to_high":
            return chargesA - chargesB;
          case "order_high_to_low":
            return ordersB - ordersA;
          case "order_low_to_high":
            return ordersA - ordersB;
          default:
            return 0;
        }
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
};

const putAstrologerProfile = async (req, res, next) => {
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
};

const putAstrologerProfileUpdate = async (req, res) => {
  try {
    const { mobileNumber } = req.params;

    // Destructure all possible fields from request body
    let {
      name,
      professions,
      languages,
      experience,
      charges,
      Description,
      country,
      gender,
    } = req.body;

    // Prepare update object
    const updateData = {};

    if (name?.trim()) updateData.name = name.trim();

    if (professions) {
      updateData.professions =
        typeof professions === "string"
          ? JSON.parse(professions)
          : professions;
    }

    if (languages) {
      updateData.languages =
        typeof languages === "string"
          ? JSON.parse(languages)
          : languages;
    }

    if (experience) updateData.experience = experience;
    if (charges) updateData.charges = charges;
    if (Description?.trim()) updateData.Description = Description.trim();
    if (country?.trim()) updateData.country = country.trim();
    if (gender?.trim()) updateData.gender = gender.trim();

    // Get existing profile to handle image replacement
    const existingProfile = await businessProfileAstrologer.findOne({ mobileNumber });

    if (!existingProfile) {
      return res.status(404).json({ error: "Astrologer profile not found" });
    }

    // Handle new image upload (optional)
    if (req.file) {
      // Delete previous image if exists
      if (existingProfile.cloudinary_id) {
        await cloudinary.uploader.destroy(existingProfile.cloudinary_id);
      }

      updateData.profileImage = req.file.path;
      updateData.cloudinary_id = req.file.filename;
    }

    // Perform the update
    const updatedProfile = await businessProfileAstrologer.findOneAndUpdate(
      { mobileNumber },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Failed to update profile" });
    }

    return res.status(200).json({
      message: "success",
      updatedProfile,
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    return res.status(500).json({ error: "Failed to update business profile" });
  }
};


const putAstrologerBusesProfileUpdate = async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const updateFields = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    // Handle professions and languages if frontend sends them as JSON strings
    if (updateFields.languages && typeof updateFields.languages === "string") {
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
      updateFields.profileImage = `${req.file.path}`;
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
};

const postAstrologerProfile = async (req, res) => {
  console.log("filename", req.file);

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
    const imageURL = `${req.file.path}`;

    const newBusinessProfile = new businessProfileAstrologer({
      name,
      professions: parsedProfessions,
      languages: parsedLanguages,
      experience,
      charges,
      Description:
        Description ||
        `${name}, a proficient Vedic Astrologer in India, is committed to helping clients in need with his spirit-guided readings. Upholding Astrology ethics, he focuses on bringing stability to lives. ${name} provides clarity and profound insights, empowering clients with spiritual knowledge about surrounding energies. Services cover Marriage Consultation, Career and Business, Love and Relationship, Wealth and Property, featuring easy and effective remedies.`,
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
      completeProfile: true,
      cloudinary_id: req.file.filename || "",
      spiritual_services: [
        {
          service: "",
          service_price: "",
          shop_id: "",
          shop_Name: "",
          shop_slug: "",
          shop_name: "",
        },
      ],
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
};

module.exports = {
  getAstrologerProfile,
  getAstrologerProfileRating,
  getAstrologerProfileFilters,
  putAstrologerProfile,
  putAstrologerProfileUpdate,
  putAstrologerBusesProfileUpdate,
  postAstrologerProfile,
  putUpdateService,
  getAstrologersServicesByShopId,
};

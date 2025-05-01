const express = require("express");
const UserLogin = require("../models/userLoginModel");
const mongoose = require("mongoose");

const AuthRoutes = express.Router();

AuthRoutes.get("/user-login", async (req, res) => {
  try {
    const loginUser = await UserLogin.find();
    res.json(loginUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user-login" });
  }
});

AuthRoutes.get("/user-login-detail/:query", async (req, res) => {
  try {
    const { query } = req.params;

    let searchCondition = { phone: query };

    if (mongoose.Types.ObjectId.isValid(query)) {
      searchCondition = { _id: new mongoose.Types.ObjectId(query) };
    }

    const loginUser = await UserLogin.findOne(searchCondition);

    if (!loginUser) {
      return res.status(404).json({ error: "Login detail not found" });
    }

    res.json(loginUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user-login" });
  }
});

AuthRoutes.put("/update-user/:phoneOrId", async (req, res) => {
  try {
    const { phoneOrId } = req.params;
    const updateFields = req.body;

    if (!Object.keys(updateFields).length) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }

    // Determine if it's a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(phoneOrId);

    const query = isObjectId ? { _id: phoneOrId } : { phone: phoneOrId };

    const updatedUser = await UserLogin.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "success",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user", details: error.message });
  }
});


AuthRoutes.post("/user-login", async (req, res) => {
  try {
    const {
      name,
      gender,
      dateOfBirth,
      reUseDateOfBirth,
      placeOfBorn,
      language,
      phone,
      totalAmount,
      freeChatStatus
    } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ error: "All fields except reUseDateOfBirth are required" });
    }

    const existingUser = await UserLogin.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    const newUser = new UserLogin({
      name,
      gender,
      dateOfBirth,
      reUseDateOfBirth,
      placeOfBorn,
      language,
      phone,
      totalAmount,
      freeChatStatus
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error during user login:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation Error", details: error.message });
    } else if (error.name === "MongoError") {
      return res
        .status(500)
        .json({ error: "Database Error", details: error.message });
    } else {
      return res
        .status(500)
        .json({ error: "Failed to process request", details: error.message });
    }
  }
});

module.exports = { AuthRoutes };

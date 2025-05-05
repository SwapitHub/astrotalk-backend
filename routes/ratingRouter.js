// routes/rating.js
const express = require("express");
const ratingModel = require("../models/ratingModel");
const ratingRoutes = express.Router();

// POST: Add  rating
ratingRoutes.post("/profile-rating", async (req, res) => {
  const { userId, astrologerId, rating, review,userName } = req.body;

  try {
  
    const newRating = new ratingModel({
      userId,
      astrologerId,
      userName,
      rating,
      review,
      createdAt: new Date(), 
    });

    await newRating.save();
    res.status(201).json({ message: "Rating added" });
  } catch (error) {
    res.status(500).json({ message: "Error saving rating", error });
  }
});


// GET: Average rating for astrologer
ratingRoutes.get("/average-rating/:id", async (req, res) => {
  try {
    const ratings = await ratingModel.find({ astrologerId: req.params.id });
    const average =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length || 0;
    res.json({ averageRating: average.toFixed(1), totalReviews: ratings.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rating", error });
  }
});

module.exports = { ratingRoutes };
// models/Rating.js
const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: true },
  userName: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Rating", ratingSchema);

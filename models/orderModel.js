// models/order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: true },
  userName: String,
  order: { type: Number},
  
}, { timestamps: true });

module.exports = mongoose.model("order", orderSchema);

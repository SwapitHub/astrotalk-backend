// routes/order.js
const express = require("express");
const orderModel = require("../models/orderModel");
const orderRoutes = express.Router();

// POST: Add  order
orderRoutes.post("/profile-order", async (req, res) => {
  const { userId, astrologerId, order, userName } = req.body;

  try {
  
    const newOrder = new orderModel({
      userId,
      astrologerId,
      userName,
      order,     
      createdAt: new Date(), 
    });

    await newOrder.save();
    res.status(201).json({ message: "order added" });
  } catch (error) {
    res.status(500).json({ message: "Error saving order", error });
  }
});




module.exports = { orderRoutes };
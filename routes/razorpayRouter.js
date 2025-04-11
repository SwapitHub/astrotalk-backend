require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const UserPayment = require("../models/razorpayModel");
const UserLogin = require("../models/userLoginModel");
const mongoose = require("mongoose");


const razorpayRouter = express.Router();
razorpayRouter.use(cors());
razorpayRouter.use(express.json());
// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.razorpayKeyId,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

razorpayRouter.get("/create-order-user-list/:query", async (req, res) => {
  try {
    const { query } = req.params;

    let searchCondition = { userMobile: query };

    if (mongoose.Types.ObjectId.isValid(query)) {
      searchCondition = { _id: new mongoose.Types.ObjectId(query) };
    }

    const loginUsers = await UserPayment.find(searchCondition); // Changed from findOne() to find()

    if (!loginUsers.length) {  // Check if array is empty
      return res.status(404).json({ error: "No login details found" });
    }

    res.json(loginUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user login details" });
  }
});


razorpayRouter.get("/create-order-user-list/:userMobile", async (req, res) => {
  try {
    const userMobile = req.params.userMobile;

    const result = await UserPayment.aggregate([
      { $match: { userMobile: userMobile } },

      {
        $group: {
          _id: "$userMobile",
          totalAmount: { $sum: "$amount" },
          orders: { $push: "$$ROOT" },
        },
      },

      {
        $project: {
          _id: 0,
          userMobile: "$_id",
          totalAmount: 1,
          orders: 1,
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching user order list:", err); // Log the error
    res.status(500).json({
      message: err.message || "Failed to fetch create-order-user-list",
    });
  }
});

// Create Order (temporary record)
razorpayRouter.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, userMobile,extraAmount , totalAmount} = req.body;
    console.log("amountdddd", amount, extraAmount);

    // Validate input
    if (!amount || !currency || !userMobile) {
      return res
        .status(400)
        .json({ error: "Amount, currency, and userMobile are required" });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
console.log(order,"orderss");

    // Create temporary payment record with "created" status
    const newPayment = new UserPayment({
      order_id: order.id,
      amount: amount,
       extraAmount: extraAmount || 0,
       totalAmount: totalAmount || 0,
      userMobile: userMobile,
      currency: currency,
      status: "FAILED", // Initial state
      createdAt: new Date(),
    });

    await newPayment.save();

    res.json(order);
  } catch (error) {
    console.error("Error in /create-order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Verify Payment and Update DB
razorpayRouter.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay key secret is not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("Signature verification failed");
      console.log("Expected:", expectedSignature);
      console.log("Received:", razorpay_signature);

      await UserPayment.findOneAndUpdate(
        { order_id: razorpay_order_id },
        { status: "failed", error: "Invalid signature" }
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Signature is valid - update payment status
    const updatedPayment = await UserPayment.findOneAndUpdate(
      { order_id: razorpay_order_id },
      {
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status: "PASSED",
        paidAt: new Date(),
      },
      { new: true }
    );
console.log("updatedPayment",updatedPayment);

    if (!updatedPayment) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update user's total amount only after successful payment
    const user = await UserLogin.findOneAndUpdate(
      { phone: updatedPayment.userMobile },
      { $inc: { totalAmount: updatedPayment.totalAmount} },
      { new: true }
    );

    if (!user) {
      console.error("User not found for payment:", updatedPayment);
    }

    return res.json({
      success: true,
      message: "Payment verified and saved to DB",
    });
  } catch (error) {
    console.error("Error in /verify-payment:", error);

    // Additional error logging for crypto errors
    if (error.message.includes("ERR_INVALID_ARG_TYPE")) {
      console.error(
        "Crypto key error - verify RAZORPAY_KEY_SECRET is set in environment"
      );
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel/Delete Order
razorpayRouter.post("/cancel-order", async (req, res) => {
  try {
    const { order_id, error } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Update the payment record with failed status
    await UserPayment.findOneAndUpdate(
      { order_id: order_id },
      {
        status: "failed",
        error: error?.description || "Payment failed",
      }
    );

    res.json({ success: true, message: "Order marked as failed" });
  } catch (error) {
    console.error("Error in /cancel-order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = { razorpayRouter };

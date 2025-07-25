require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");
const UserLogin = require("../models/userLoginModel");
const UserPaymentShop = require("../models/razorPayShopModel");

const razorpayRouter = express.Router();
razorpayRouter.use(cors());
razorpayRouter.use(express.json());
// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



const getRazorpayShopOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert to numbers for pagination calculations
    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);

    // Calculate the skip and take for pagination
    const skip = (pageNumber - 1) * pageLimit;

    // Get the total count of records in the database
    const totalOrders = await UserPaymentShop.countDocuments();

    // Retrieve paginated orders
    const orders = await UserPaymentShop.find()
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 }); // Sort by most recent orders

    // Calculate pagination metadata (next and prev page)
    const totalPages = Math.ceil(totalOrders / pageLimit);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    const pagination = {
      currentPage: pageNumber,
      totalPages: totalPages,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null,
    };

    // Send the response with orders and pagination info
    res.json({
      orders,
      pagination,
    });
  } catch (error) {
    console.error("Error in /get-orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const postRazorpayShopOrder = async (req, res) => {
  try {
    const {
      amount,
      currency,
      userMobile,
      extraAmount,
      totalAmount,
      astrologerName,
      productName
    } = req.body;

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

    // Create temporary payment record with "created" status
    const newPayment = new UserPaymentShop({
      order_id: order.id,
      amount: amount,
      extraAmount: extraAmount || 0,
      totalAmount: totalAmount || 0,
      userMobile: userMobile,
      currency: currency,
      astrologerName,
      productName,
      status: "FAILED", // Initial state
      createdAt: new Date(),
    });

    await newPayment.save();

    res.json(order);
  } catch (error) {
    console.error("Error in /create-order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const postRazorpayShopVeryFy = async (req, res) => {
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
      await UserPaymentShop.findOneAndUpdate(
        { order_id: razorpay_order_id },
        { status: "failed", error: "Invalid signature" }
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Signature is valid - update payment status
    const updatedPayment = await UserPaymentShop.findOneAndUpdate(
      { order_id: razorpay_order_id },
      {
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status: "PASSED",
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update user's total amount only after successful payment
    // const user = await UserLogin.findOneAndUpdate(
    //   { phone: updatedPayment.userMobile },
    //   { $inc: { totalAmount: updatedPayment.totalAmount } },
    //   { new: true }
    // );

    // if (!user) {
    //   console.error("User not found for payment:", updatedPayment);
    // }

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
};

const postRazorpayCancelShopOrder = async (req, res) => {
  try {
    const { order_id, error } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Update the payment record with failed status
    await UserPaymentShop.findOneAndUpdate(
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
};

module.exports = {
  postRazorpayShopOrder,
  postRazorpayShopVeryFy,
  postRazorpayCancelShopOrder,
  getRazorpayShopOrders
};

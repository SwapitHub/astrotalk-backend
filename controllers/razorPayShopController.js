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


const updateAnyFieldPaymentShop = async (req, res) => {
  const { order_id } = req.params;
  const updateData = req.body;

  try {
    const updatedDoc = await UserPaymentShop.findOneAndUpdate(
      { order_id },               // Match condition
      updateData,                 // Fields to update
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "Payment record not found with given order_id" });
    }

    return res.status(200).json({ message: "Updated successfully", data: updatedDoc });
  } catch (error) {
    console.error("Error updating by order_id:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


const getRazorpayShopOrderDetail = async (req, res) => {
  const { order_id } = req.params;

  try {
    if (!order_id) {
      return res.status(404).json({ message: "Order ID is not found" });
    }

    const orderDetail = await UserPaymentShop.findOne({ order_id });

    if (!orderDetail) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "success",
      data: orderDetail,
    });
  } catch (error) {
    console.error("Error retrieving order details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getRazorpayShopOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, productType } = req.query;

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNumber - 1) * pageLimit;

    // Construct the query object
    const query = {};

    if (productType && productType !== "all") {
      query.productType = productType;
    }

    const totalOrders = await UserPaymentShop.countDocuments(query);

    const orders = await UserPaymentShop.find(query)
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalOrders / pageLimit);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      orders,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        nextPage: hasNextPage ? pageNumber + 1 : null,
        prevPage: hasPrevPage ? pageNumber - 1 : null,
      },
    });
  } catch (error) {
    console.error("Error in /shop-order-list:", error);
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
      productName,
      productType,
      productImg,
      address,
    } = req.body;

    // Validate input
    if (!amount || !currency || !userMobile) {
      return res
        .status(400)
        .json({ error: "Amount, currency, and userMobile are required" });
    }

    // Ensure the address is present or initialize as empty array

    // Validate address fields if address is provided
    if (
      address &&
      (!address.name ||
        !address.mobile ||
        !address.email ||
        !address.flat ||
        !address.locality ||
        !address.city ||
        !address.state ||
        !address.country ||
        !address.pin)
    ) {
      return res.status(400).json({ error: "All address fields are required" });
    }
    const addressData = address ? address : [];
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
      productType,
      productImg,
      status: "FAILED", // Initial state
      createdAt: new Date(),
      addresses: addressData,
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
  getRazorpayShopOrders,
  getRazorpayShopOrderDetail,
  updateAnyFieldPaymentShop
};

require("dotenv").config();
const express = require("express");

const {
  getRazorpayPayment,
  getRazorpayList,
  postRazorpayOrder,
  postRazorpayVeryFy,
  postRazorpayCancelOrder,
} = require("../controllers/razorpayController");

const razorpayRouter = express.Router();

razorpayRouter.get("/create-order-user-list/:query", getRazorpayPayment);

razorpayRouter.get("/create-order-user-list/:userMobile", getRazorpayList);

// Create Order (temporary record)
razorpayRouter.post("/create-order", postRazorpayOrder);

// Verify Payment and Update DB
razorpayRouter.post("/verify-payment", postRazorpayVeryFy);

// Cancel/Delete Order
razorpayRouter.post("/cancel-order", postRazorpayCancelOrder);

module.exports = { razorpayRouter };

require("dotenv").config();
const express = require("express");
const {
  postRazorpayShopOrder,
  postRazorpayShopVeryFy,
  postRazorpayCancelShopOrder,
  getRazorpayShopOrders,
  getRazorpayShopOrderDetail,
} = require("../controllers/razorPayShopController");

const razorpayShopRouter = express.Router();

razorpayShopRouter.get("/shop-order-list-detail/:order_id", getRazorpayShopOrderDetail)

razorpayShopRouter.get("/shop-order-list", getRazorpayShopOrders);

// Create Order (temporary record)
razorpayShopRouter.post("/create-order-shop", postRazorpayShopOrder);

// Verify Payment and Update DB
razorpayShopRouter.post("/verify-payment-shop", postRazorpayShopVeryFy);

// Cancel/Delete Order
razorpayShopRouter.post("/cancel-order-shop", postRazorpayCancelShopOrder);

module.exports = { razorpayShopRouter };

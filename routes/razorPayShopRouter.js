require("dotenv").config();
const express = require("express");
const {
  postRazorpayShopOrder,
  postRazorpayShopVeryFy,
  postRazorpayCancelShopOrder,
  getRazorpayShopOrders,
  getRazorpayShopOrderDetail,
  updateAnyFieldPaymentShop,
} = require("../controllers/razorPayShopController");

const razorpayShopRouter = express.Router();

razorpayShopRouter.get("/shop-order-list-detail/:order_id", getRazorpayShopOrderDetail)

razorpayShopRouter.put("/update-any-field-payment-shop/:order_id", updateAnyFieldPaymentShop)

razorpayShopRouter.get("/shop-order-list", getRazorpayShopOrders);

// Create Order (temporary record)
razorpayShopRouter.post("/create-order-shop", postRazorpayShopOrder);

// Verify Payment and Update DB
razorpayShopRouter.post("/verify-payment-shop", postRazorpayShopVeryFy);

// Cancel/Delete Order
razorpayShopRouter.post("/cancel-order-shop", postRazorpayCancelShopOrder);

module.exports = { razorpayShopRouter };

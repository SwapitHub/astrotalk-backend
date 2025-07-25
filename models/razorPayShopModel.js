const mongoose = require("mongoose");

const PaymentShopSchema = new mongoose.Schema(
  {
    order_id: String,
    payment_id: String,
    signature: String,
    amount: Number,
    extraAmount: Number,
    totalAmount: Number,
    currency: String,
    userMobile: Number,
    astrologerName: String,
    productName: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const UserPaymentShop = mongoose.model("PaymentShop", PaymentShopSchema);

module.exports = UserPaymentShop;

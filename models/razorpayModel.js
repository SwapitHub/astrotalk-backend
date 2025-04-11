const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    order_id: String,
    payment_id: String,
    signature: String,
    amount: Number,
    extraAmount: Number,
    totalAmount: Number,
    currency: String,
    userMobile: Number,
    status: { type: String, default: "pending" },
  }, { timestamps: true });
  
  const UserPayment = mongoose.model("Payment", PaymentSchema);

  module.exports = UserPayment;
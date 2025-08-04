const mongoose = require("mongoose");

const PaymentShopSchema = new mongoose.Schema(
  {
    order_id: String,
    payment_id: String,
    signature: String,
    totalAmount: Number,
    gstAmount: Number,
    adminCommission: Number,
    currency: String,
    userMobile: Number,
    astrologerName: String,
    productName: String,
    productType: String,
    productImg: String,
    ring_size: String,
    gemStone_product_price: String,
    status: { type: String, default: "pending" },

    addresses: [
      {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        altMobile: { type: String },
        email: { type: String, required: true },
        flat: { type: String, required: true },
        locality: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pin: { type: String, required: true },
        landmark: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const UserPaymentShop = mongoose.model("PaymentShop", PaymentShopSchema);

module.exports = UserPaymentShop;

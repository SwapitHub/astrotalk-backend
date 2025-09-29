const mongoose = require("mongoose");

const paymentWithdrawSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    upiId: { type: String, required: true, trim: true, lowercase: true },
    holderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },

    // ✅ New fields to match frontend
    totalACBalance: { type: Number, default: 0 },
    balanceRemaining: { type: Number, default: 0 },
    remarks: { type: String, trim: true },
    AstrologerEmail: { type: String, trim: true },

    adminEmail: { type: String, required: true, trim: true },
    astrologerPhone: { type: String, trim: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const PaymentWithdraw = mongoose.model(
  "PaymentWithdraw",
  paymentWithdrawSchema
);
module.exports = PaymentWithdraw;

const mongoose = require("mongoose");

const paymentWithdrawSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  upiId: {
    type: String,
    required: [true, "UPI ID is required"],
    trim: true,
    lowercase: true,
  },

  holderName: {
    type: String,
    required: [true, "Account holder name is required"],
    trim: true,
  },
  bankName: {
    type: String,
    required: [true, "Bank name is required"],
    trim: true,
  },
  accountNumber: {
    type: String,
    required: [true, "Account number is required"],
    trim: true,
  },
  ifscCode: {
    type: String,
    required: [true, "IFSC code is required"],
    trim: true,
    uppercase: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  }
}, {
  timestamps: true 
});

const PaymentWithdraw = mongoose.model("PaymentWithdraw", paymentWithdrawSchema);
module.exports = PaymentWithdraw;

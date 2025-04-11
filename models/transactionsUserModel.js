const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["user", "astrologer", "admin"],
      required: true,
    },  
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, 
    astrologer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: false },
    availableBalance: { type: Number, required: true },
    description: { type: String, required: true },
    transactionAmount: { type: String, required: true },
    invoice: { type: Boolean, default: false },
    action: { type: Boolean, default: false },
    astroMobile: { type: String, required: false },
    name: { type: String, required: true },
    userName: { type: String, required: false },
  },
  { timestamps: true }
);

const WalletTransaction = mongoose.model("WalletTransaction", WalletTransactionSchema);

module.exports = WalletTransaction;

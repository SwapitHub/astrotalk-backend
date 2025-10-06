const mongoose = require("mongoose");

const UserLoginSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    gender: { type: String, required: false },
    dateOfBirth: { type: String, required: false },
    reUseDateOfBirth: { type: String, required: false },
    placeOfBorn: { type: String, required: false },
    language: { type: String, required: false },
    totalAmount: { type: Number, required: false },
    phone: { type: Number, required: true },
    deleteUser: Boolean,
    blockUser:Boolean,
    freeChatStatus: Boolean,
    chatStatus: Boolean,
  },
  { timestamps: true }
);
const UserLogin = mongoose.model("UserLogin", UserLoginSchema);

module.exports = UserLogin;

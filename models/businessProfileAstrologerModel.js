const mongoose = require("mongoose");

const businessProfileAstrologerSchema = new mongoose.Schema({
  name: String,
  professions: [{ type: String }],
  languages: [{ type: String, required: true }],
  spiritual_services: [
    {
      service: { type: String, required: false },
      service_price: { type: String, required: false },
    },
  ],
  experience: String,
  charges: String,
  Description: String,
  minute: { type: String, required: false },
  mobileNumber: String,
  profileImage: String,
  profileStatus: Boolean,
  chatStatus: Boolean,
  country: String,
  gender: String,
  starRating: String,
  totalOrders: { type: Number, default: 0 },
  offers: String,
  freeChatStatus: Boolean,
  requestStatus: Boolean,
  astroTotalChatTime: Number,
  topAstrologer: String,
  completeProfile: Boolean,
  cloudinary_id: String,
});

const businessProfileAstrologer = mongoose.model(
  "businessProfileAstrologer",
  businessProfileAstrologerSchema
);
module.exports = businessProfileAstrologer;

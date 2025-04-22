const mongoose = require("mongoose");

const userSignUpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true },
  languages: [{ type: String, required: true }],
  skills: { type: String, required: true },
  deviceUse: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  astroStatus: { type: Boolean, required: true },
  mobileNumber: { type: String, required: true },
}, { timestamps: true }); 

const AstrologerRegistration = mongoose.model("AstrologerRegistration", userSignUpSchema);
module.exports = AstrologerRegistration;

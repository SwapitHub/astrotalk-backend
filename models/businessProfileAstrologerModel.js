const mongoose = require("mongoose");

const businessProfileAstrologerSchema = new mongoose.Schema({
  name: String,
  professions: [{ type: String }],  
  languages: [{ type: String, required: true }],
  experience: String,  
  charges : String,
  Description : String,
  minute : {type: String, required: false},
  mobileNumber: String,
  profileImage: String,
  profileStatus: Boolean,
  chatStatus: Boolean,
  country: String,
  gender: String,
  starRating: String,
  orders: String,
  offers: String
});

const businessProfileAstrologer = mongoose.model("businessProfileAstrologer" , businessProfileAstrologerSchema)
module.exports =  businessProfileAstrologer
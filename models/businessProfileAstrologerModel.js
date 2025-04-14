const mongoose = require("mongoose");

const businessProfileAstrologerSchema = new mongoose.Schema({
  name: String,
  profession: String,
  languages: String,
  experience: String,  
  charges : String,
  Description : String,
  minute : {type: String, required: false},
  mobileNumber: String,
  profileImage: {type: String, required: false},
  profileStatus: Boolean,
  chatStatus: Boolean
});

const businessProfileAstrologer = mongoose.model("businessProfileAstrologer" , businessProfileAstrologerSchema)
module.exports =  businessProfileAstrologer
const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    userMobile: { type: String, required: true },
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
  { timestamps: true }
);

const SaveAddress = mongoose.model("SaveAddress", AddressSchema);
module.exports=SaveAddress

const mongoose = require("mongoose")

const AddFooterProductSchema = new mongoose.Schema({ 
  footerProductName: { type: String, required: true },
  footerProductLink: { type: String, required: true },
}, { timestamps: true }); 

const footerProduct = mongoose.model("FooterProduct", AddFooterProductSchema);
module.exports = footerProduct;
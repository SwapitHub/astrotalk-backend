const mongoose = require("mongoose")

const AddLanguageSchema = new mongoose.Schema({ 
  languages: { type: String, required: true },
}, { timestamps: true }); 

const AddLanguage = mongoose.model("AddLanguage", AddLanguageSchema);
module.exports = AddLanguage;
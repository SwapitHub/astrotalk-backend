const mongoose = require("mongoose")

const AddProfessionSchema = new mongoose.Schema({ 
  professions: { type: String, required: true },
}, { timestamps: true }); 

const AddProfession = mongoose.model("AddProfession", AddProfessionSchema);
module.exports = AddProfession;
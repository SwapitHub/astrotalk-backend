const mongoose = require("mongoose")

const AdminCommissionPujaSchema = new mongoose.Schema({ 
  AdminCommissionsPuja: { type: Number, required: true },
}, { timestamps: true }); 

const AdminCommissionPuja = mongoose.model("AddAdminCommissionPuja", AdminCommissionPujaSchema);
module.exports = AdminCommissionPuja;
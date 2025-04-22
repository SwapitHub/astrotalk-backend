const mongoose = require("mongoose")

const AdminCommissionSchema = new mongoose.Schema({ 
  AdminCommissions: { type: Number, required: true },
}, { timestamps: true }); 

const AdminCommission = mongoose.model("AddAdminCommission", AdminCommissionSchema);
module.exports = AdminCommission;
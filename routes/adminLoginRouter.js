const express = require("express");
const { getAdminData, changePassword } = require("../controllers/adminLoginController");

const adminRoutes = express.Router();

// Get all admins
adminRoutes.get("/admin", getAdminData);
adminRoutes.post("/admin/change-password", changePassword);

module.exports = adminRoutes;

const express = require("express");
const { getAdminData } = require("../controllers/adminLoginController");

const adminRoutes = express.Router();

// Get all admins
adminRoutes.get("/admin", getAdminData);

module.exports = adminRoutes;

const express = require("express");
const { getAddCommissionAstro, deleteAddCommissionAstro, setAddCommissionAstro } = require("../controllers/adminCommissionController");
const adminCommissionRoute = express.Router();


adminCommissionRoute.get("/add-AdminCommission-astrologer", getAddCommissionAstro);

adminCommissionRoute.delete("/delete-AdminCommission-astrologer/:id", deleteAddCommissionAstro);
  

adminCommissionRoute.post("/add-AdminCommission-astrologer", setAddCommissionAstro);

module.exports = adminCommissionRoute;
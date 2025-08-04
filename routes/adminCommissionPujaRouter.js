const express = require("express");
const { getAddCommissionAstroPuja, setAddCommissionAstroPuja, deleteAddCommissionAstroPuja } = require("../controllers/adminCommissionPujaController");
const adminCommissionRoutePuja = express.Router();


adminCommissionRoutePuja.get("/add-AdminCommission-puja-astrologer", getAddCommissionAstroPuja);

adminCommissionRoutePuja.delete("/delete-AdminCommission-puja-astrologer/:id", deleteAddCommissionAstroPuja);
  

adminCommissionRoutePuja.post("/add-AdminCommission-puja-astrologer", setAddCommissionAstroPuja);

module.exports = adminCommissionRoutePuja;
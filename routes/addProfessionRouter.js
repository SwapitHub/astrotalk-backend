const express = require("express");
const {
  getAddProfessionAstro,
  deleteAddProfessionAstro,
  setAddProfessionAstro,
} = require("../controllers/addProfessionController");

const addProfessionRoute = express.Router();

addProfessionRoute.get("/add-Profession-astrologer", getAddProfessionAstro);

addProfessionRoute.delete(
  "/delete-Profession-astrologer/:id",
  deleteAddProfessionAstro
);

addProfessionRoute.post("/add-Profession-astrologer", setAddProfessionAstro);

module.exports = addProfessionRoute;

const express = require("express");
const addLanguageRoute = express.Router();
const {
  getAddLanguageAstro,
  deleteAddLanguageAstro,
  setAddLanguageAstro,
} = require("../controllers/addLanguageController");

addLanguageRoute.get("/add-Language-astrologer", getAddLanguageAstro);
addLanguageRoute.delete(
  "/delete-language-astrologer/:id",
  deleteAddLanguageAstro
);

addLanguageRoute.post("/add-Language-astrologer", setAddLanguageAstro);

module.exports = addLanguageRoute;

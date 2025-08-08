const express = require("express");
const { getAddFooterProductAstro, deleteAddFooterProductAstro, postAddFooterProductAstro } = require("../controllers/addFooterController");

const addProductFooterRoute = express.Router();


addProductFooterRoute.get("/get-footerProduct-astrologer", getAddFooterProductAstro);
addProductFooterRoute.delete(
  "/delete-footerProduct-astrologer/:id",
  deleteAddFooterProductAstro
);

addProductFooterRoute.post("/post-footerProduct-astrologer", postAddFooterProductAstro);

module.exports = addProductFooterRoute;

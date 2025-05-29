const express = require("express");
const {
  getDenoMinationAdmin,
  getDenoMinationAdminList,
  setDenoMinationAdmin,
} = require("../controllers/denominationAdminController");

const denominationRoute = express.Router();

denominationRoute.get("/denomination-admin-detail/:id", getDenoMinationAdmin);

denominationRoute.get("/denomination-admin", getDenoMinationAdminList);

denominationRoute.post("/denomination-admin", setDenoMinationAdmin);

module.exports = { denominationRoute };

const express = require("express");
const {
  getDenoMinationAdmin,
  getDenoMinationAdminList,
  setDenoMinationAdmin,
  deleteDenominationAdmin,
} = require("../controllers/denominationAdminController");

const denominationRoute = express.Router();

denominationRoute.get("/denomination-admin-detail/:id", getDenoMinationAdmin);

denominationRoute.get("/denomination-admin", getDenoMinationAdminList);

denominationRoute.delete("/delete-denomination-admin/:id", deleteDenominationAdmin)

denominationRoute.post("/denomination-admin", setDenoMinationAdmin);

module.exports = { denominationRoute };

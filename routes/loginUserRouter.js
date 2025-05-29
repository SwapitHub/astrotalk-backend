const express = require("express");
const {
  getUserLogin,
  getUserLoginDetail,
  updateUser,
  setUserLogin,
} = require("../controllers/loginUserController");

const AuthRoutes = express.Router();

AuthRoutes.get("/user-login", getUserLogin);
AuthRoutes.get("/user-login-detail/:query", getUserLoginDetail);
AuthRoutes.put("/update-user/:phoneOrId", updateUser);
AuthRoutes.post("/user-login", setUserLogin);

module.exports = { AuthRoutes };

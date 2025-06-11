const express = require("express");
const {
  getUserLogin,
  getUserLoginDetail,
  updateUser,
  setUserLogin,
} = require("../controllers/loginUserController");
const { verifyCommonToken } = require("../utils/publicToken");

const AuthRoutes = express.Router();

// AuthRoutes.use(verifyCommonToken);
AuthRoutes.get("/user-login", getUserLogin);
AuthRoutes.get("/user-login-detail/:query", getUserLoginDetail);
AuthRoutes.put("/update-user/:phoneOrId", updateUser);
AuthRoutes.post("/user-login", setUserLogin);

module.exports = { AuthRoutes };

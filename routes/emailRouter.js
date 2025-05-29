const express = require("express");
const { setSendRegistration } = require("../controllers/emailController");
const emailRouter = express.Router();

emailRouter.post("/send-registration-email", setSendRegistration);

module.exports = emailRouter;

const express = require("express");
const { postRegistrationUser } = require("../controllers/userSeminarRegistrationControllers");

const userSeminar = express.Router();

userSeminar.post("/post-user-registrations-seminar",  postRegistrationUser)

module.exports = {userSeminar}
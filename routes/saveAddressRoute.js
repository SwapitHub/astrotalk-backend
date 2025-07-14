const express = require("express")
const saveAddress = require("../controllers/saveAddressController")
const addressRoute = express.Router()


addressRoute.post("/save-address", saveAddress)

module.exports = {addressRoute}


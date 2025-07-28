const express = require("express")
const {saveAddress,getSaveAddress} = require("../controllers/saveAddressController")
const addressRoute = express.Router()


addressRoute.post("/save-address", saveAddress)

addressRoute.get("/get-save-address-detail/:id", getSaveAddress)

module.exports = {addressRoute}


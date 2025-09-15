const express = require("express")
const {saveAddress,getSaveAddress, updateAddress} = require("../controllers/saveAddressController")
const addressRoute = express.Router()


addressRoute.post("/save-address", saveAddress)

addressRoute.get("/get-save-address-detail/:userMobile", getSaveAddress)

addressRoute.put("/update-save-address-detail/:userMobile", updateAddress)


module.exports = {addressRoute}


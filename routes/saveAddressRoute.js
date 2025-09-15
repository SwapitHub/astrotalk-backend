const express = require("express")
const {saveAddress,getSaveAddress, updateAddress, getSaveAddressId} = require("../controllers/saveAddressController")
const addressRoute = express.Router()


addressRoute.post("/save-address", saveAddress)

addressRoute.get("/get-save-address-detail/:userMobile", getSaveAddress)
addressRoute.get("/get-save-address-detail/:id", getSaveAddressId)
addressRoute.put("/update-save-address-detail/:userMobile", updateAddress)


module.exports = {addressRoute}


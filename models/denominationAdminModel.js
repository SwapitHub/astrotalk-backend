const mongoose = require("mongoose")

const denominationAdminSchema = new mongoose.Schema({
    amount: String,
    extraAmount: String,
    mostPopular : {type: Boolean, required: false}
})

const denominationAdmin = mongoose.model("denominationAdmin",denominationAdminSchema)

module.exports = denominationAdmin
const mongoose = require("mongoose")

const userSeminarStatus = new mongoose.Schema({
    userName: String,
    userEmail: String,
    astrologer_id: String,
})

const userSeminar = mongoose.model("userSeminar", userSeminarStatus)

module.exports = userSeminar;
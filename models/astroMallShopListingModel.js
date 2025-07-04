const { default: mongoose } = require("mongoose");

const astroMallShopSchema = new mongoose.Schema({
    offer_title: String,
    astroMallImg: String,
    offer_name: String,
    description: String,
     cloudinary_id: String
})

const astroMallShopListing = mongoose.model("astroMallShopListing",astroMallShopSchema)
module.exports = astroMallShopListing
const SaveAddress = require("../models/saveAddressModel");

// POST: Create new address
const saveAddress= async (req, res) => {
  try {
    const {
      name,
      mobile,
      altMobile,
      email,
      flat,
      locality,
      city,
      state,
      country,
      pin,
      landmark,
    } = req.body;

    // Simple validation
    if (!name || !mobile || !email || !flat || !locality || !city || !state || !country || !pin) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newAddress = new SaveAddress({
      name,
      mobile,
      altMobile,
      email,
      flat,
      locality,
      city,
      state,
      country,
      pin,
      landmark,
    });

    await newAddress.save();

    res.status(201).json({ success: true, message: "Address saved successfully", data: newAddress });
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = saveAddress;

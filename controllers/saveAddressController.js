const SaveAddress = require("../models/saveAddressModel");

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

const getSaveAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    const address = await SaveAddress.findById(id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address found", data: address });
  } catch (error) {
    console.error("Error retrieving address:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = {
  saveAddress,
  getSaveAddress,
};

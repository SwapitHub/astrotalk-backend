const SaveAddress = require("../models/saveAddressModel");

const saveAddress= async (req, res) => {
  try {
    const {
      name,
      mobile,
      altMobile,
      userMobile,
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
      userMobile,
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

const updateAddress = async (req, res) => {
  try {
    const { userMobile } = req.params;
    const updateData = req.body;

    const allowedFields = [
      "name", "mobile", "altMobile", "email",
      "flat", "locality", "city", "state",
      "country", "pin", "landmark"
    ];

    const filteredUpdate = {};
    for (let key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredUpdate[key] = updateData[key];
      }
    }

    const updatedAddress = await SaveAddress.findOneAndUpdate(
      { userMobile },
      { $set: filteredUpdate },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address by userMobile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




const getSaveAddress = async (req, res) => {
  try {
    const { userMobile } = req.params;

    const address = await SaveAddress.findOne({ userMobile });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    console.error("Error fetching address by userMobile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



module.exports = {
  saveAddress,
  getSaveAddress,
  updateAddress
};

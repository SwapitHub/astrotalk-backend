const AdminCommissionPuja = require("../models/adminCommissionPujaModel");

const getAddCommissionAstroPuja = async (req, res) => {
  try {
    const AdminCommissionData = await AdminCommissionPuja.find();
    res.json(AdminCommissionData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAddCommissionAstroPuja = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAdminCommission = await AdminCommissionPuja.findByIdAndDelete(id);

    if (!deletedAdminCommission) {
      return res.status(404).json({ message: "AdminCommission not found" });
    }

    res.status(200).json({
      message: "success",
      data: deletedAdminCommission,
    });
  } catch (error) {
    console.error("delete-AdminCommission-astrologer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const setAddCommissionAstroPuja = async (req, res) => {    
  try {
    const { AdminCommissionsPuja } = req.body;
    if (!AdminCommissionsPuja) {
      return res.status(400).json({ message: "Please fill AdminCommissionsPuja" });
    }

    const newAdminCommission = new AdminCommissionPuja({
        AdminCommissionsPuja
    });

    await newAdminCommission.save();

    res.status(200).json({
      message: "success",
      data: newAdminCommission,
    });
  } catch (error) {
    console.error("add-AdminCommission-astrologer:", error);
  }
}


module.exports = {
  getAddCommissionAstroPuja,
  deleteAddCommissionAstroPuja,
  setAddCommissionAstroPuja
};

const AdminCommission = require("../models/adminCommissionModel");

const getAddCommissionAstro = async (req, res) => {
  try {
    const AdminCommissionData = await AdminCommission.find();
    res.json(AdminCommissionData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAddCommissionAstro = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAdminCommission = await AdminCommission.findByIdAndDelete(id);

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

const setAddCommissionAstro = async (req, res) => {    
  try {
    const { AdminCommissions } = req.body;
    if (!AdminCommissions) {
      return res.status(400).json({ message: "Please fill AdminCommissions" });
    }

    const newAdminCommission = new AdminCommission({
        AdminCommissions
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
  getAddCommissionAstro,
  deleteAddCommissionAstro,
  setAddCommissionAstro
};

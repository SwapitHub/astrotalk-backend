const AdminSpiritualServices = require("../models/adminSpiritualServicesModel");

const getAddServices = async (req, res) => {
  try {
    const AdminServicesData = await AdminSpiritualServices.find();
    res.json(AdminServicesData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAddServices = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAdminServices = await AdminSpiritualServices.findByIdAndDelete(id);

    if (!deletedAdminServices) {
      return res.status(404).json({ message: "AdminServices not found" });
    }

    res.status(200).json({
      message: "success",
      data: deletedAdminServices,
    });
  } catch (error) {
    console.error("delete-AdminServices-astrologer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const postAddServices = async (req, res) => {    
  try {
    const { AdminServices } = req.body;
    if (!AdminServices) {
      return res.status(400).json({ message: "Please fill AdminServices" });
    }

    const newAdminServices = new AdminSpiritualServices({
        AdminServices
    });

    await newAdminServices.save();

    res.status(200).json({
      message: "success",
      data: newAdminServices,
    });
  } catch (error) {
    console.error("add-AdminServices-astrologer:", error);
  }
}


module.exports = {
  getAddServices,
  deleteAddServices,
  postAddServices
};

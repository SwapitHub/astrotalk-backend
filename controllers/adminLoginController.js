const Admin = require("../models/adminLoginModel");

// Create default admin once, never update
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });

    if (!existingAdmin) {
      const newAdmin = new Admin({
        email: "admin@gmail.com",
        password: "admin123",
      });

      await newAdmin.save();
      console.log("✅ Default admin created");
    } else {
      console.log("ℹ️ Admin already exists, no changes made");
    }
  } catch (err) {
    console.error("❌ Error creating default admin:", err);
    setTimeout(createDefaultAdmin, 5000); // Retry after 5 seconds
  }
};

// Automatically run when file is loaded
createDefaultAdmin();



const getAdminData = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: "Failed to get admins", error: err });
  }
}

module.exports = {
    getAdminData
}
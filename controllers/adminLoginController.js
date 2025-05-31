const Admin = require("../models/adminLoginModel");
const bcrypt = require("bcrypt");

// Create default admin once, never update
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });

    if (!existingAdmin) {
      const newAdmin = new Admin({
        email: "admin@gmail.com",
        password: "admin123", // Plain text password
      });

      await newAdmin.save();
      console.log("✅ Default admin created");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
};

createDefaultAdmin();



const getAdminData = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: "Failed to get admins", error: err });
  }
}


const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.password !== oldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating password", error: err.message });
  }
};


const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", admin });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};



module.exports = {
    getAdminData,
    changePassword,
    loginAdmin
}
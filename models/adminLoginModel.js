const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Prevent changing default admin credentials
adminSchema.pre("save", async function (next) {
  if (!this.isNew) {
    const existing = await this.constructor.findById(this._id);
    if (
      existing.email === "admin@gmail.com" &&
      (this.isModified("email") || this.isModified("password"))
    ) {
      return next(new Error("Modification of default admin credentials is not allowed"));
    }
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

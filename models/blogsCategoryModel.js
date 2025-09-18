const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const categoryBlogs = mongoose.model("categoryBlogs", CategorySchema);
module.exports = categoryBlogs;

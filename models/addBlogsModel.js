const mongoose = require("mongoose");

const AddBlogsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    shortDescription: String,
    content: String,
    author: { type: String, default: "Admin" },
    tags: [String],
    coverImage: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

// Prevent overwrite error in development
const AddBlogs = mongoose.models.AddBlogs || mongoose.model("AddBlogs", AddBlogsSchema);

module.exports = AddBlogs;

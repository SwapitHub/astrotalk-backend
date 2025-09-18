const { default: mongoose } = require("mongoose");


const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const categoryBlogs = mongoose.model("categoryBlogs",CategorySchema)

module.exports = categoryBlogs;

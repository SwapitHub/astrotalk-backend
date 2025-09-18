const categoryBlogs = require("../models/blogsCategoryModel");

const handleGetAllCategories = async (req, res) => {
  try {
    const AddBlogsCategoryData = await categoryBlogs.find();
    res.json(AddBlogsCategoryData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlogsCategory = await categoryBlogs.findByIdAndDelete(id);

    if (!deletedBlogsCategory) {
      return res.status(404).json({ message: "BlogsCategory not found" });
    }

    res.status(200).json({
      message: "success",
      data: deletedBlogsCategory,
    });
  } catch (error) {
    console.error("delete-language-astrologer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const handleCategoryPost = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Please fill blogs category" });
    }

    const newBlogsCategory = new categoryBlogs({
      name,
    });

    await newBlogsCategory.save();

    res.status(200).json({
      message: "success",
      data: newBlogsCategory,
    });
  } catch (error) {
    console.error("add-BlogsCategory error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  handleCategoryPost,
  handleDeleteCategory,
  handleGetAllCategories
};


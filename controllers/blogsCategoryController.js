const categoryBlogs = require("../models/blogsCategoryModel");

// CREATE Category
const handleCategoryPost = async (req, res) => {
  try {
    const { name, description, slug } = req.body;

    // Check if name or slug already exists
    const existing = await categoryBlogs.findOne({
      $or: [{ name }, { slug }]
    });

    if (existing) {
      return res.status(400).json({ error: "Category name or slug already exists" });
    }

    const category = new categoryBlogs({ name, description, slug });
    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      category
    });
  } catch (err) {
    console.error("Error creating category:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};;

// GET All Categories
const handleGetAllCategories = async (req, res) => {
  try {
    const categories = await categoryBlogs.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// GET One Category by Slug
const handleGetCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categoryBlogs.findOne({ slug });

    if (!category) return res.status(404).json({ error: "Category not found" });

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// UPDATE Category
const handleUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await categoryBlogs.findByIdAndUpdate(
      id,
      { name, description, slug: slugify(name, { lower: true, strict: true }) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

// DELETE Category
const handleDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await categoryBlogs.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ error: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

module.exports = {
  handleCategoryPost,
  handleGetAllCategories,
  handleGetCategoryBySlug,
  handleUpdateCategory,
  handleDeleteCategory
};

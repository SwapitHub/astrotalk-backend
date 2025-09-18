const AddBlogs = require("../models/addBlogsModel");

// ✅ POST: Create a new blog
const handlePostAddBlogs = async (req, res) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      content,
      author,
      tags,
      coverImage,
      category
    } = req.body;

    const generatedSlug = slug;

    // Check duplicate slug
    const existing = await AddBlogs.findOne({ slug: generatedSlug });
    if (existing) return res.status(400).json({ error: "Slug already exists" });

    const blog = new AddBlogs({
      title,
      slug: generatedSlug,
      shortDescription,
      content,
      author,
      tags,
      coverImage,
      category
    });

    const saved = await blog.save();
    res.status(201).json({ message: "Blog created", blog: saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog", message: error.message });
  }
};

// ✅ GET: All blogs
const handleGetAllAddBlogs = async (req, res) => {
  try {
    const blogs = await AddBlogs.find().populate("category").sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs", message: error.message });
  }
};

// ✅ GET: Single blog by ID
const handleGetDetailAddBlogs = async (req, res) => {
  try {
    const { id } = req.query;
    const blog = await AddBlogs.findById(id).populate("category");
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog", message: error.message });
  }
};

// ✅ PUT: Update blog by ID
const handlePutAddBlogs = async (req, res) => {
  try {
    const { id } = req.query;
    const {
      title,
      slug,
      shortDescription,
      content,
      author,
      tags,
      coverImage,
      category
    } = req.body;

    const updatedSlug = slug ;

    // Prevent slug duplication
    const existing = await AddBlogs.findOne({ slug: updatedSlug, _id: { $ne: id } });
    if (existing) return res.status(400).json({ error: "Slug already in use" });

    const updated = await AddBlogs.findByIdAndUpdate(
      id,
      {
        title,
        slug: updatedSlug,
        shortDescription,
        content,
        author,
        tags,
        coverImage,
        category
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json({ message: "Blog updated", blog: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog", message: error.message });
  }
};

// ✅ DELETE: Delete blog by ID
const handleDeleteAddBlogs = async (req, res) => {
  try {
    const { id } = req.query;
    const deleted = await AddBlogs.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json({ message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog", message: error.message });
  }
};

module.exports = {
  handlePostAddBlogs,
  handleGetAllAddBlogs,
  handleGetDetailAddBlogs,
  handlePutAddBlogs,
  handleDeleteAddBlogs
};

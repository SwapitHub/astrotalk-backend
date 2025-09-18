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
      category
    } = req.body;

    // If slug not provided, generate from title
    const generatedSlug = slug ? slug : title.toLowerCase().replace(/\s+/g, '-');

    // Check duplicate slug
    const existing = await AddBlogs.findOne({ slug: generatedSlug });
    if (existing) return res.status(400).json({ error: "Slug already exists" });

    // Get image info from multer upload
    const coverImage = req.file ? req.file.filename : null; // or req.file.path depending on your setup

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
// ✅ GET: Retrieve all blogs
const handleGetAllAddBlogs = async (req, res) => {
  try {
    // Optional: Add filters like category, tags, author, etc.
    const filters = {};

    if (req.query.category) filters.category = req.query.category;
    if (req.query.author) filters.author = req.query.author;
    if (req.query.tag) filters.tags = { $in: [req.query.tag] }; // for single tag
    // For multiple tags: filters.tags = { $all: req.query.tags.split(',') }

    const blogs = await AddBlogs.find(filters).sort({ createdAt: -1 }); // latest first

    res.status(200).json({ blogs });
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
    const { id } = req.params;
    const {
      title,
      slug,
      shortDescription,
      content,
      author,
      tags,
      category
    } = req.body;

    // Find existing blog by ID
    const existingBlog = await AddBlogs.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Determine the slug to use
    const updatedSlug = slug
      ? slug
      : title
      ? title.toLowerCase().replace(/\s+/g, '-')
      : existingBlog.slug;

    // Check for duplicate slug (exclude current blog)
    const duplicate = await AddBlogs.findOne({ slug: updatedSlug, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    // Handle cover image update if new file is uploaded
    const updatedCoverImage = req.file ? req.file.filename : existingBlog.coverImage;

    // Update fields
    existingBlog.title = title || existingBlog.title;
    existingBlog.slug = updatedSlug;
    existingBlog.shortDescription = shortDescription || existingBlog.shortDescription;
    existingBlog.content = content || existingBlog.content;
    existingBlog.author = author || existingBlog.author;
    existingBlog.tags = tags || existingBlog.tags;
    existingBlog.coverImage = updatedCoverImage;
    existingBlog.category = category || existingBlog.category;

    // Save updates
    const updatedBlog = await existingBlog.save();

    res.status(200).json({ message: "Blog updated", blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog", message: error.message });
  }
};


// ✅ DELETE: Delete blog by ID

const handleDeleteAddBlogs = async (req, res) => {
  try {
    const { id } = req.params;
console.log(id,"id=====");

    const deletedBlog = await AddBlogs.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully", blog: deletedBlog });
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

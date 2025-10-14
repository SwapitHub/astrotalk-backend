const AddBlogs = require("../models/addBlogsModel");
const cloudinary = require("../config/cloudinary");

// ✅ POST: Create a new blog
const handlePostAddBlogs = async (req, res) => {
  try {
    const { title, slug, shortDescription, content, author, category } = req.body;

    const generatedSlug = slug ? slug : title.toLowerCase().replace(/\s+/g, "-");

    const existing = await AddBlogs.findOne({ slug: generatedSlug });
    if (existing) return res.status(400).json({ error: "Slug already exists" });

    // ✅ Construct clean relative image URL
    let coverImage = null;
    if (req.file) {
      const imagePath = req.file.path.split("public")[1]; // "/uploads/filename.jpg"
      coverImage = `/public${imagePath.replace(/\\/g, "/")}`;
    }

    const blog = new AddBlogs({
      title,
      slug: generatedSlug,
      shortDescription,
      content,
      author,
      coverImage,
      category,
      deleteStatus: false
    });

    const saved = await blog.save();
    res.status(201).json({ message: "Blog created", blog: saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog", message: error.message });
  }
};


const handleGetAllAddBlogs = async (req, res) => {
  try {
    const filters = {};

    // Category & author filters
    if (req.query.category) filters.category = req.query.category;
    if (req.query.author) filters.author = req.query.author;

    // Search filter - search across multiple fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i"); // case-insensitive

      filters.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { author: { $regex: searchRegex } },
        { shortDescription: { $regex: searchRegex } },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBlogs = await AddBlogs.countDocuments(filters);

    const blogs = await AddBlogs.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalBlogs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        totalBlogs,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch blogs", message: error.message });
  }
};

// ✅ GET: Single blog by ID
const handleGetDetailAddBlogs = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the blog by slug
    const blog = await AddBlogs.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch blog", message: error.message });
  }
};

// ✅ PUT: Update blog by ID (remove old image from local storage if new image uploaded)
const handlePutAddBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, shortDescription, content, author, category } = req.body;

    // Find existing blog
    const existingBlog = await AddBlogs.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Generate / validate slug
    const updatedSlug = slug
      ? slug
      : title
      ? title.toLowerCase().replace(/\s+/g, "-")
      : existingBlog.slug;

    const duplicate = await AddBlogs.findOne({
      slug: updatedSlug,
      _id: { $ne: id },
    });
    if (duplicate) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    let updatedCoverImage = existingBlog.coverImage;

    // ✅ If new image uploaded
    if (req.file) {
      // Delete old image file from /public/uploads
      if (existingBlog.coverImage) {
        const oldImagePath = path.join(__dirname, "..", existingBlog.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // ✅ Extract clean relative path from multer absolute path
      const imagePath = req.file.path.split("public")[1]; // "/uploads/filename.jpg"
      updatedCoverImage = `/public${imagePath.replace(/\\/g, "/")}`; // "/public/uploads/filename.jpg"
    }

    // Update fields
    existingBlog.title = title || existingBlog.title;
    existingBlog.slug = updatedSlug;
    existingBlog.shortDescription = shortDescription || existingBlog.shortDescription;
    existingBlog.content = content || existingBlog.content;
    existingBlog.author = author || existingBlog.author;
    existingBlog.coverImage = updatedCoverImage;
    existingBlog.category = category || existingBlog.category;

    // Save updated blog
    const updatedBlog = await existingBlog.save();

    res.status(200).json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update blog",
      message: error.message,
    });
  }
};

// ✅ DELETE: Delete blog by ID

const handleDeleteAddBlogs = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await AddBlogs.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (blog.deleteStatus) {
      return res.status(400).json({ error: "Blog already deleted" });
    }

    // Soft delete: just update deleteStatus flag
    blog.deleteStatus = true;
    await blog.save();

    res.status(200).json({
      message: "success",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete blog",
      message: error.message,
    });
  }
};

module.exports = {
  handlePostAddBlogs,
  handleGetAllAddBlogs,
  handleGetDetailAddBlogs,
  handlePutAddBlogs,
  handleDeleteAddBlogs,
};

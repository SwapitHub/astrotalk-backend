const SaveSeoMetaData = require("../models/seoMetaDataMdel");

// DELETE /delete-seo-meta-data/:id

const deleteSeoMetaDataBySlug = async (req, res) => {
  try {
    const { _id } = req.params;

    const deleted = await SaveSeoMetaData.findByIdAndDelete(_id);

    if (!deleted) {
      return res.status(404).json({ error: "SEO metadata not found" });
    }

    res.status(200).json({ message: "success", data: deleted });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// PUT /update-seo-meta-data/:id

const updateSeoMetaDataBySlug = async (req, res) => {
  try {
    const { _id } = req.params;

    const updated = await SaveSeoMetaData.findByIdAndUpdate(
      _id,
      {
        $set: {
          page: req.body.page,
          meta_title: req.body.meta_title,
          meta_description: req.body.meta_description,
          slug: req.body.slug,
          keywords: req.body.keywords,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "SEO metadata not found" });
    }

    res.status(200).json({ message: "success", data: updated });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const getSeoMetaData = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const totalDocuments = await SaveSeoMetaData.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    if (page > totalPages && totalDocuments !== 0) {
      return res.status(400).json({ error: "Page out of range" });
    }

    const seoData = await SaveSeoMetaData.find()
      .sort({ createdAt: -1 }) // newest first
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalDocuments,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    return res.status(200).json({ message: "success", data: seoData, pagination });
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
// GET SEO Meta by Slug
const getSeoMetaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    const metaData = await SaveSeoMetaData.findOne({ slug });

    if (!metaData) {
      return res.status(404).json({ error: "SEO metadata not found" });
    }

    res.status(200).json({ data: metaData });
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const postSeoFetchData = async (req, res) => {
  try {
    const { page, meta_title, meta_description, slug, keywords } = req.body;

    if (!page || !slug || !meta_title || !meta_description) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let existingMeta = await SaveSeoMetaData.findOne({ slug });

    if (existingMeta) {
      existingMeta.meta_title = meta_title;
      existingMeta.meta_description = meta_description;
      existingMeta.page = page;
      existingMeta.keywords = keywords;

      await existingMeta.save();
      return res.status(200).json({
        message: "success",
        data: existingMeta,
      });
    }

    // Create new meta
    const newMeta = new SaveSeoMetaData({
      page,
      slug,
      meta_title,
      meta_description,
      keywords,
    });

    await newMeta.save();

    res.status(201).json({ message: "success.", data: newMeta });
  } catch (error) {
    console.error("Error saving SEO metadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { postSeoFetchData , getSeoMetaBySlug, getSeoMetaData,updateSeoMetaDataBySlug, deleteSeoMetaDataBySlug};

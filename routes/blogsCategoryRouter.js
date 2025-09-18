const express = require("express");
const { handleCategoryPost, handleGetAllCategories, handleGetCategoryBySlug, handleUpdateCategory, handleDeleteCategory } = require("../controllers/blogsCategoryController");


const blockCategory = express.Router()

blockCategory.post("post-category-blogs", handleCategoryPost)

blockCategory.get("get-all-category-blogs", handleGetAllCategories)

blockCategory.get("get-detail-category-blogs/:slug", handleGetCategoryBySlug)

blockCategory.put("put-update-category-blogs/:id", handleUpdateCategory)

blockCategory.delete("delete-update-category-blogs/:id", handleDeleteCategory)


module.exports = {blockCategory};
const express = require("express");
const {
  handleCategoryPost,
  handleGetAllCategories,
  handleDeleteCategory,
} = require("../controllers/blogsCategoryController");

const blockCategory = express.Router();

blockCategory.post("/post-category-blogs", handleCategoryPost);  

blockCategory.get("/get-all-category-blogs", handleGetAllCategories);  

blockCategory.delete("/delete-update-category-blogs/:id", handleDeleteCategory);  

module.exports = { blockCategory };

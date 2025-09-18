const express = require("express")
const { handlePostAddBlogs, handleGetAllAddBlogs, handleGetDetailAddBlogs, handlePutAddBlogs, handleDeleteAddBlogs } = require("../controllers/addBlogsController")

const addBlogs = express.Router()

addBlogs.post("post-add-blogs", handlePostAddBlogs)

addBlogs.get("get-add-blogs-all", handleGetAllAddBlogs)

addBlogs.get("get-add-blogs-detail", handleGetDetailAddBlogs)

addBlogs.put("put-add-blogs-update", handlePutAddBlogs)

addBlogs.delete("delte-add-blogs/:id", handleDeleteAddBlogs)



module.exports = {addBlogs}
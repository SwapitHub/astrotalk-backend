const express = require("express")
const { handlePostAddBlogs, handleGetAllAddBlogs, handleGetDetailAddBlogs, handlePutAddBlogs, handleDeleteAddBlogs } = require("../controllers/addBlogsController")
const upload = require("../middlewares/multerConfig")

const addBlogs = express.Router()

addBlogs.post("/post-add-blogs", upload.single('image'), handlePostAddBlogs)

addBlogs.get("/get-add-blogs-all", handleGetAllAddBlogs)

addBlogs.get("/get-add-blogs-detail/:slug", handleGetDetailAddBlogs)

addBlogs.put("/put-add-blogs-update/:id",upload.single("image"), handlePutAddBlogs)

addBlogs.delete("/delete-add-blogs/:id", handleDeleteAddBlogs)



module.exports = {addBlogs}
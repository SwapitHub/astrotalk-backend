const express = require("express");
const { postSeminarFetchData, getSeminarFetchData, deleteSeminarFetchData } = require("../controllers/seminarController");
const upload = require("../middlewares/multerConfig");

const seminarData = express.Router();

seminarData.post("/post-seminar-data", upload.single('image'), postSeminarFetchData);
seminarData.get("/get-seminar-list-data", getSeminarFetchData)
seminarData.delete("/delete-seminar-list-data/:id", deleteSeminarFetchData);
// seminarData.put("/put-seminar-list-data/:id", upload.single("image"), putSeminarFetchData);




module.exports= {seminarData};
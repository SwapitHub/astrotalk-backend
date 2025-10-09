const fs = require("fs");
const path = require("path");
const seminarData = require("../models/seminarModel");

// ✅ Helper to delete local file
const deleteLocalImage = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Failed to delete image:", err.message);
  }
};

// ✅ CREATE Seminar
const postSeminarFetchData = async (req, res) => {
  try {
    const {
      name,
      seminar_topic,
      date_of_seminar,
      time_of_seminar,
      mobile_number,
      location_seminar,
      email,
      seminar_detail,
      seminar_status: rawStatus,
      seminar_link
    } = req.body;

    const seminar_status = rawStatus === "true" || rawStatus === true;

    const image = req.file;

    if (
      !name ||
      !seminar_topic ||
      !date_of_seminar ||
      !time_of_seminar ||
      !mobile_number ||
      !location_seminar ||
      !email ||      
      !seminar_link
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let img_url = "";
    if (image) {
      img_url = `/public/uploads/${image.filename}`;
    }

    const newSeminar = new seminarData({
      name,
      seminar_topic,
      date_of_seminar,
      time_of_seminar,
      mobile_number,
      location_seminar,
      email,
      seminar_detail,
      seminar_status,
      seminar_link,
      singleImages: {
        img_url,
        cloudinary_id: "", // remove from schema if unused
      },
    });

    const savedSeminar = await newSeminar.save();

    return res.status(201).json({
      message: "success",
      data: savedSeminar,
    });
  } catch (err) {
    console.error("Error saving seminar data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// ✅ READ Seminars
const getSeminarFetchData = async (req, res) => {
  try {
    const seminars = await seminarData.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Fetched seminars successfully",
      data: seminars,
    });
  } catch (error) {
    console.error("Error fetching seminar data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ UPDATE Seminar
const putSeminarFetchData = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const image = req.file;

    const seminar = await seminarData.findById(id);
    if (!seminar) {
      return res.status(404).json({ error: "Seminar not found" });
    }

    // ✅ Delete old local image if new one uploaded
    if (image) {
      if (seminar.singleImages?.img_url) {
        const oldImagePath = path.join(__dirname, "..", seminar.singleImages.img_url);
        deleteLocalImage(oldImagePath);
      }

      updateData.singleImages = {
        img_url: `/public/uploads/${image.filename}`,
        cloudinary_id: "", // Optional: remove this field from schema if not used anymore
      };
    }

    const updatedSeminar = await seminarData.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: "success",
      data: updatedSeminar,
    });
  } catch (err) {
    console.error("Error updating seminar data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ DELETE Seminar
const deleteSeminarFetchData = async (req, res) => {
  try {
    const { id } = req.params;

    const seminar = await seminarData.findById(id);
    if (!seminar) {
      return res.status(404).json({ error: "Seminar not found" });
    }

    // ✅ Delete local image if exists
    if (seminar.singleImages?.img_url) {
      const imagePath = path.join(__dirname, "..", seminar.singleImages.img_url);
      deleteLocalImage(imagePath);
    }

    await seminarData.findByIdAndDelete(id);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("Error deleting seminar:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  postSeminarFetchData,
  getSeminarFetchData,
  deleteSeminarFetchData,
  putSeminarFetchData,
};

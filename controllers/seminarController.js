const seminarData = require("../models/seminarModel");
const cloudinary = require("../config/cloudinary");

const putSeminarFetchData = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const image = req.file;

    // find existing seminar
    const seminar = await seminarData.findById(id);
    if (!seminar) {
      return res.status(404).json({ error: "Seminar not found" });
    }

    // if new image uploaded, delete old one from cloudinary
    if (image) {
      if (seminar.image?.cloudinary_id) {
        await cloudinary.uploader.destroy(seminar.image.cloudinary_id);
      }

      const uploadResult = await cloudinary.uploader.upload(image.path, {
        folder: "seminars",
      });

      updateData.image = {
        img_url: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
      };
    }

    // update in DB
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

const deleteSeminarFetchData = async (req, res) => {
  try {
    const { id } = req.params;

    const seminar = await seminarData.findById(id);
    if (!seminar) {
      return res.status(404).json({ error: "Seminar not found" });
    }

    // Delete image from Cloudinary if exists
    if (seminar.singleImages && seminar.singleImages.cloudinary_id) {
      await cloudinary.uploader.destroy(seminar.singleImages.cloudinary_id);
    }

    await seminarData.findByIdAndDelete(id);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("Error deleting seminar:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSeminarFetchData = async (req, res) => {
  try {
    const seminars = await seminarData.find().sort({ createdAt: -1 }); // Latest first
    return res.status(200).json({
      message: "Fetched seminars successfully",
      data: seminars,
    });
  } catch (error) {
    console.error("Error fetching seminar data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


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
      seminar_status,
      seminar_link
    } = req.body;

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
    let cloudinary_id = "";

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image.path, {
        folder: "seminars",
      });

      img_url = uploadResult.secure_url;
      cloudinary_id = uploadResult.public_id;
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
        cloudinary_id,
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

module.exports = { postSeminarFetchData, getSeminarFetchData, deleteSeminarFetchData,putSeminarFetchData };

const seminarData = require("../models/seminarModel");
const cloudinary = require("../config/cloudinary");


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

    return res.status(200).json({ message: "Seminar deleted successfully" });
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
    } = req.body;

    const image = req.file;

    if (
      !name ||
      !seminar_topic ||
      !date_of_seminar ||
      !time_of_seminar ||
      !mobile_number ||
      !location_seminar ||
      !email
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

module.exports = { postSeminarFetchData, getSeminarFetchData, deleteSeminarFetchData };

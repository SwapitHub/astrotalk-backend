const mongoose = require("mongoose");

const seminarDataSchema = new mongoose.Schema(
  {
    name: String,
    seminar_topic: String,
    date_of_seminar: String,
    time_of_seminar: String,
    location_seminar: String,
    email: String,
    mobile_number: String,
    seminar_detail: String,
    singleImages: {
      img_url: String,
      cloudinary_id: String,
    },
  },
  { timestamps: true }
);

const seminarData = mongoose.model("seminarData", seminarDataSchema);

module.exports = seminarData;

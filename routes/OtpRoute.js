const express = require("express");
const axios = require("axios");
const OTP = require("../models/otpModel");

const otpRoutes = express.Router();

// Send OTP
otpRoutes.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const fast2smsAPIKey = process.env.FAST2SMS_API_KEY;
    if (!fast2smsAPIKey) {
      return res
        .status(500)
        .json({ success: false, message: "API key not configured" });
    }

    const fast2smsURL = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsAPIKey}&variables_values=${otp}&route=otp&numbers=${phone}`;

    // ✅ Fast2SMS को Bearer token की ज़रूरत नहीं होती
    const response = await axios.get(fast2smsURL, {
      headers: { authorization: fast2smsAPIKey },
    });

    if (response.data.return) {
      // ✅ OTP DB में save
      await OTP.create({ phone, otp });
      // return res.json({
      //   success: true,
      //   message: "OTP sent successfully",
      // });
      return res.json({ success: true, message: "OTP sent successfully",  OTP ,otp }); // Remove OTP from response in production

    } else {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error(
      "Error sending OTP:",
      error?.response?.data || error.message
    );
    res
      .status(500)
      .json({ success: false, message: "Error sending OTP", error: error.message });
  }
});


// Verify OTP
otpRoutes.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const record = await OTP.findOne({ phone, otp });

    if (record) {
      // await OTP.deleteOne({ _id: record._id }); 
      return res.json({ success: true, message: "OTP verification successful" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP or expired" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});

module.exports = otpRoutes;

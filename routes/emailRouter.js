const express = require("express");
const { sendRegistrationSuccessEmail } = require("../controllers/emailController");
const emailRouter = express.Router();

emailRouter.post("/send-registration-email", async (req, res) => {
  try {
    const { email, name } = req.body;

    // Basic validation
    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required." });
    }

    console.log("Sending registration email to:", email, "Name:", name);

    const result = await sendRegistrationSuccessEmail(email, name);

    if (result.success) {
      console.log("✅ Email sent successfully");
      return res.status(200).json({ message: "Registration email sent successfully." });
    } else {
      console.error("❌ Email sending failed:", result.error);
      return res.status(500).json({ message: "Failed to send email.", error: result.error });
    }
  } catch (error) {
    console.error("⚠️ Unexpected error:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
});

module.exports = emailRouter;

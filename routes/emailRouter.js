const express = require("express");
const { sendRegistrationSuccessEmail } = require("../controllers/emailController");
const emailRouter = express.Router();

emailRouter.post("/send-registration-email", async (req, res) => {
  const { email, name } = req.body;
console.log("email, name",email, name);

  const result = await sendRegistrationSuccessEmail(email, name);
  if (result.success) {
    res.status(200).json({ message: "Registration email sent" });
    console.log({ message: "Registration email sent" });
  } else {
    res.status(500).json({ message: "Failed to send email", error: result.error });
  }
});

module.exports = emailRouter;

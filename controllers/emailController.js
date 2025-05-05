const nodemailer = require("nodemailer");

const sendRegistrationSuccessEmail = async (email, astrologerName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or use SMTP config for Outlook, Yahoo, etc.
      auth: {
        user: "swapit.testing@gmail.com", 
        pass: "Swapit@123",
      },
    });

    const mailOptions = {
      from: `"Astro App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Registration Successful 🎉",
      html: `
        <h2>Hello ${astrologerName},</h2>
        <p>Thank you for registering with <strong>Astro App</strong>.</p>
        <p>Your account has been successfully created and is now under review.</p>
        <p>We'll notify you once it's activated.</p>
        <br />
        <p>Best regards,<br />Astro App Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

module.exports = { sendRegistrationSuccessEmail };

const nodemailer = require("nodemailer");

const sendRegistrationSuccessEmail = async (
  email,
  astrologerName,
  astrologerMobile
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "info@demoprojectwork.com",
        pass: "bQ|4TcE+Py1",
      },
    });

    const mailOptions = {
      from: `"Astro App" <info@demoprojectwork.com>`,
      to: email,
      subject: "Registration Successful 🎉",
      html: `
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top; background-color: #f2f2f2;" width="100%" >
    <tbody>
        <tr>
            <td style="padding: 20px 0px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; width:100%; max-width: 600px;">
                    <tbody>
                        <tr>
                            <td style="font-family: Arial, Helvetica, sans-serif; padding: 20px;">
                                <h2>Hello ${astrologerName},</h2>
                                <h3>You can now log in using the mobile number: ${astrologerMobile}</h3>
                                <p>Thank you for registering with <strong>Astro App</strong>.</p>
                                <p>Your account has been successfully created and is currently under review.</p>
                                <p>We will notify you once your account has been activated.</p>
                                <br />
                                <p>Best regards,<br />The Astro App Team</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>

      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};


const setSendRegistration = async (req, res) => {
  try {
    const { email, name, mobile } = req.body;

    // Basic validation
    if (!email || !name || !mobile) {
      return res.status(400).json({ message: "Email, mobile and name are required." });
    }

    console.log("Sending registration email to:", email, "Name:", name, mobile);

    const result = await sendRegistrationSuccessEmail(email, name, mobile);

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
}


module.exports = { setSendRegistration };

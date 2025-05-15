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

module.exports = { sendRegistrationSuccessEmail };

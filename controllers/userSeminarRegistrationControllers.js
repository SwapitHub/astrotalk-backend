const seminarData = require("../models/seminarModel");
const userSeminar = require("../models/userSeminarRegistrationModel");
const nodemailer = require("nodemailer");

const sendRegistrationSuccessEmail = async (userName, astrologer_id, userEmail) => {
  try {
    // 1️⃣ Fetch seminar details from DB
    const seminar = await seminarData.findById(astrologer_id);

    if (!seminar) {
      throw new Error("Seminar not found for this astrologer_id");
    }

     const astrologerName = seminar.name || "Astrologer";
    const topic = seminar.seminar_topic || "Astrology Seminar";
    const date = seminar.date_of_seminar || "TBA";
    const time = seminar.time_of_seminar || "TBA";
    const location = seminar.location_seminar || "Online";
    const seminarLink = seminar.seminar_link || "#";

    // 2️⃣ Setup mail transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "info@demoprojectwork.com",
        pass: "bQ|4TcE+Py1", // ⚠️ should be in .env file
      },
    });

    // 3️⃣ Mail template
    const mailOptions = {
      from: `"Astro App" <info@demoprojectwork.com>`,
      to: userEmail,
      subject: "Registration Successful 🎉",
       html: `
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" 
               style="background-color:#f9f9f9; width:100%; padding:20px;">
          <tbody>
            <tr>
              <td>
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" 
                       style="background-color:#ffffff; width:100%; max-width:600px; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
                  <tbody>
                    <tr>
                      <td style="font-family: Arial, Helvetica, sans-serif; padding: 30px;">
                        <h2 style="color:#333;">Hello ${userName},</h2>
                        <p style="font-size:16px; color:#555;">
                          Thank you for registering for the seminar with <strong>${astrologerName}</strong>.
                          We’re excited to have you join us!
                        </p>

                        <h3 style="margin-top:20px; color:#444;">📌 Seminar Details:</h3>
                        <ul style="font-size:15px; color:#555; line-height:1.6;">
                          <li><strong>Topic:</strong> ${topic}</li>
                          <li><strong>Date:</strong> ${date}</li>
                          <li><strong>Time:</strong> ${time}</li>
                          <li><strong>Location:</strong> ${location}</li>
                        </ul>

                        ${
                          seminarLink && seminarLink !== "#"
                            ? `<p style="margin-top:20px;">
                                <a href="${seminarLink}" target="_blank" 
                                   style="background-color:#4CAF50; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px;">
                                   Join Seminar
                                </a>
                              </p>`
                            : ""
                        }

                        <p style="margin-top:30px; font-size:14px; color:#888;">
                          Best regards,<br />
                          <strong>The Astro App Team</strong>
                        </p>
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

    // 4️⃣ Send email
    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};


const postRegistrationUser = async (req, res) => {
  try {
    const { userName, userEmail, astrologer_id } = req.body;

    // 1️⃣ Basic validation
    if (!userName || !userEmail || !astrologer_id) {
      return res.status(400).json({
        success: false,
        error: "All fields (userName, userEmail, astrologer_id) are required",
      });
    }

    // 2️⃣ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // 3️⃣ Prevent duplicate registration (check first, before saving or sending mail)
    const existingUser = await userSeminar.findOne({
      userEmail: userEmail.toLowerCase(),
      astrologer_id,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "You have already registered for this seminar.",
      });
    }

    // 4️⃣ Save new registration
    const newUserSeminar = new userSeminar({
      userName,
      userEmail: userEmail.toLowerCase(), // normalize email
      astrologer_id,
    });

    const savedSeminarUser = await newUserSeminar.save();

    // 5️⃣ Send confirmation email only once after successful save
    const result = await sendRegistrationSuccessEmail(
      userName,
      userEmail,
      astrologer_id
    );

    if (!result.success) {
      console.warn("⚠️ Email not sent:", result.error);
    }

    // 6️⃣ Respond success
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: savedSeminarUser,
    });
  } catch (err) {
    console.error("postRegistrationUser Error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  postRegistrationUser,
};

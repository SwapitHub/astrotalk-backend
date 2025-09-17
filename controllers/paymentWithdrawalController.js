const PaymentWithdraw = require("../models/paymentWithdrawalModel");
const nodemailer = require("nodemailer");

const sendPaymentWithdrawSuccessEmail = async (userName, withdrawalId, adminEmail) => {
    try {
        // 1️⃣ Fetch withdrawal details from DB
        const withdrawal = await PaymentWithdraw.findById(withdrawalId);

        if (!withdrawal) {
            throw new Error("Withdrawal request not found");
        }

        // Destructure details
        const {
            name,
            upiId,
            holderName,
            bankName,
            accountNumber,
            ifscCode,
            status,
            createdAt,
        } = withdrawal;

        // 2️⃣ Setup mail transporter (keep your SMTP config secure in env variables)
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: "info@demoprojectwork.com",
                pass: "bQ|4TcE+Py1", // ⚠️ should be in .env file
            },
        });

        // 3️⃣ Compose mail content
        const mailOptions = {
            from: `"Astro App" <info@demoprojectwork.com>`,
            to: adminEmail,
            subject: "Payment Withdrawal Request Received ✅",
            html: `
        <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hello ${userName},</h2>
            <p style="color: #555; font-size: 16px;">
              We have received your payment withdrawal request. Here are the details:
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tbody>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name (UPI):</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>UPI ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${upiId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Account Holder Name:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${holderName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Bank Name:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${bankName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Account Number:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${accountNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>IFSC Code:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${ifscCode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-transform: capitalize;">${status}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Requested At:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date(createdAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <p style="margin-top: 30px; font-size: 14px; color: #777;">
              We will process your request as soon as possible. If you have any questions, please contact support.
            </p>
            <p style="color: #555; font-size: 14px;">
              Best regards,<br/>
              <strong>The Astro App Team</strong>
            </p>
          </div>
        </div>
      `,
        };

        // 4️⃣ Send the email
        await transporter.sendMail(mailOptions);

        return { success: true };
    } catch (error) {
        console.error("Error sending payment withdrawal email:", error);
        return { success: false, error: error.message };
    }
};

const handlePostPaymentWithdrawal = async (req, res) => {
    try {
        const {
            name,
            upiId,
            holderName,
            bankName,
            accountNumber,
            ifscCode,
            userId,
            adminEmail,
            astrologerPhone,
        } = req.body;

        const newRequest = new PaymentWithdraw({
            name,
            upiId,
            holderName,
            bankName,
            accountNumber,
            ifscCode,
            userId,
            adminEmail,
            astrologerPhone
        });

        await newRequest.save();

        await sendPaymentWithdrawSuccessEmail(name, newRequest._id, adminEmail);

        return res.status(201).json({
            message: "Withdrawal request submitted successfully",
            data: newRequest
        });
    } catch (error) {
        console.error("Error creating withdrawal:", error);
        return res.status(500).json({
            message: "Failed to submit withdrawal request",
            error: error.message
        });
    }
};



const handleGetAllPaymentWithdrawal = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    const total = await PaymentWithdraw.countDocuments();

    const data = await PaymentWithdraw.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching withdrawals", message: error.message });
  }
};


const handleGetDetailPaymentWithdrawal = async (req, res) => {
  try {
    const { astrologerPhone } = req.params;

    const withdrawals = await PaymentWithdraw.find({ astrologerPhone });

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({ error: "No withdrawal records found for this astrologer" });
    }

    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    res.status(500).json({ error: "Error fetching withdrawal" });
  }
};


const handlePutPaymentWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Optionally: you can check if all required fields are present in updateData here

        const updated = await PaymentWithdraw.findByIdAndUpdate(id, updateData, {
            new: true,          // return updated document
            runValidators: true, // validate all fields according to schema
            overwrite: true     // **Important** for PUT to replace whole document except _id
        });

        if (!updated) {
            return res.status(404).json({ error: "Withdrawal not found" });
        }

        res.status(200).json({
            message: "Withdrawal updated successfully",
            data: updated,
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update withdrawal" });
    }
};



// DELETE /api/withdrawals/:id
const handleDeletePaymentWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await PaymentWithdraw.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ error: "Withdrawal not found" });
        }

        return res.status(200).json({ message: "Withdrawal deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({ error: "Failed to delete withdrawal" });
    }
};


module.exports = {
    handlePostPaymentWithdrawal,
    handleGetAllPaymentWithdrawal,
    handleGetDetailPaymentWithdrawal,
    handlePutPaymentWithdrawal,
    handleDeletePaymentWithdrawal
}
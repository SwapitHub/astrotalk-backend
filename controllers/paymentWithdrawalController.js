const PaymentWithdraw = require("../models/paymentWithdrawalModel");

const handlePostPaymentWithdrawal = async (req, res) => {
    try {
        const {
            name,
            upiId,
            holderName,
            bankName,
            accountNumber,
            ifscCode,
            userId
        } = req.body;

        const newRequest = new PaymentWithdraw({
            name,
            upiId,
            holderName,
            bankName,
            accountNumber,
            ifscCode,
            userId
        });

        await newRequest.save();

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
        const data = await PaymentWithdraw.find().sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching withdrawals" });
    }
}

const handleGetDetailPaymentWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await PaymentWithdraw.findById(id);

        if (!withdrawal) {
            return res.status(404).json({ error: "Withdrawal not found" });
        }

        res.status(200).json(withdrawal);
    } catch (error) {
        res.status(500).json({ error: "Error fetching withdrawal" });
    }
}

const handlePutPaymentWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await PaymentWithdraw.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!updated) {
            return res.status(404).json({ error: "Withdrawal not found" });
        }

        res.status(200).json({
            message: "Withdrawal updated successfully",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update withdrawal" });
    }
}


const handleDeletePaymentWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await PaymentWithdraw.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ error: "Withdrawal not found" });
        }

        res.status(200).json({ message: "Withdrawal deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete withdrawal" });
    }
}

module.exports = {
    handlePostPaymentWithdrawal,
    handleGetAllPaymentWithdrawal,
    handleGetDetailPaymentWithdrawal,
    handlePutPaymentWithdrawal,
    handleDeletePaymentWithdrawal
}
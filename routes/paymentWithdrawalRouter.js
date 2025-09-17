const express =require("express");
const { handlePostPaymentWithdrawal, handleGetAllPaymentWithdrawal, handleGetDetailPaymentWithdrawal, handlePutPaymentWithdrawal, handleDeletePaymentWithdrawal } = require("../controllers/paymentWithdrawalController");

const paymentWithdrawalRoutes = express.Router();

paymentWithdrawalRoutes.post("/post-payment-withdrawal", handlePostPaymentWithdrawal)
paymentWithdrawalRoutes.get("/get-all-payment-withdrawal", handleGetAllPaymentWithdrawal);
paymentWithdrawalRoutes.get("/get-detail-payment-withdrawal/:astrologerPhone", handleGetDetailPaymentWithdrawal);
paymentWithdrawalRoutes.put("/put-payment-withdrawal/:id", handlePutPaymentWithdrawal);
paymentWithdrawalRoutes.delete("/delete-payment-withdrawal/:id", handleDeletePaymentWithdrawal);

module.exports = {paymentWithdrawalRoutes}
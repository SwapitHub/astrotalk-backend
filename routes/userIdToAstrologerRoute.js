const express = require("express");
const userIdSendToAstrologer = require("../models/userIdToAstrologerModel");
const UserLogin = require("../models/userLoginModel");
const {
  updateUserIdToAstrologer,
  getUserIdToAstrologer,
  getUserIdToAstrologerDetail,
  getSendUserIdToAst,
} = require("../controllers/userIdToAstrologerController");

const userIdAstRoute = express.Router();

userIdAstRoute.put(
  "/userId-to-astrologer-astro-list-update",
  updateUserIdToAstrologer
);

userIdAstRoute.get(
  "/userId-to-astrologer-astro-list/:userIdToAst",
  getUserIdToAstrologer
);

userIdAstRoute.get(
  "/userId-to-astrologer-detail/:id",
  getUserIdToAstrologerDetail
);

userIdAstRoute.get("/get-userId-to-astrologer", getSendUserIdToAst);

async function socketUserIdToAstrologerMsg(io) {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("typing", (data) => {
      socket.broadcast.emit("typing", data);
      // console.log(data, "typings");

      io.emit("typing-status", {
        message: "You have a new typing!",
        data,
      });
    });

    socket.on("astrologer-chat-status", async (astrologerData) => {
      console.log("🔔 astrologer-chat-status:", astrologerData);

      io.emit("astrologer-data-received-new-notification", {
        message: "You have a new chat request!",
        astrologerData,
      });
    });

    socket.on("astrologer-chat-requestStatus", async (requestStatusData) => {
      console.log("🔔 astrologer-chat-requestStatusd:", requestStatusData);

      io.emit("astrologer-requestStatus-new-notification", {
        message: "You have a new close request!",
        requestStatusData,
      });
    });

    socket.on("astrologer-chat-requestPaidChat", async (requestStatusData) => {
      console.log("🔔 astrologer-chat-requestPaidChat:", requestStatusData);

      io.emit("astrologer-requestPaidChat-new-notification", {
        message: "You have a new chat request!",
        requestStatusData,
      });
    });

    socket.on(
      "astrologer-chat-request-FreeChat",
      async (requestStatusFreeChat) => {
        console.log(
          "🔔 astrologer-chat-request-FreeChat",
          requestStatusFreeChat
        );

        io.emit("astrologer-request-FreeChat-new-notification", {
          message: "You have a new free chat request!",
          requestStatusFreeChat,
        });
      }
    );

    socket.on("userId-to-astrologer", async (messageId) => {
      console.log("📩 Received messageIds:", messageId);

      try {
        if (!messageId) throw new Error("messageId is undefined");

        const {
          userIdToAst,
          astrologerIdToAst,
          mobileNumber,
          profileImage,
          astroName,
          astroCharges,
          astroExperience,
          chatId,
          chatType,
          chatDuration,
          chatDeduction,
          DeleteOrderHistoryStatus,
          chatStatus,
          profileStatus,
          userName,
          userDateOfBirth,
          userPlaceOfBorn,
          userBornTime,
          requestStatus,
        } = messageId;

        // 🚨 Field validation
        const requiredFields = {
          userIdToAst,
          astrologerIdToAst,
          mobileNumber,
          profileImage,
          astroName,
          astroCharges,
          astroExperience,
        };

        const missingFields = Object.entries(requiredFields)
          .filter(([_, val]) => !val)
          .map(([key]) => key);

        if (missingFields.length > 0) {
          throw new Error(
            `Required fields are missing: ${missingFields.join(", ")}`
          );
        }

        // ✅ Save to DB
        const newUserIdToAst = new userIdSendToAstrologer({
          userIdToAst,
          astrologerIdToAst,
          mobileNumber,
          profileImage,
          astroName,
          astroCharges,
          astroExperience,
          chatId,
          chatType,
          chatDuration,
          chatDeduction,
          DeleteOrderHistoryStatus,
          chatStatus,
          profileStatus,
          userName,
          userDateOfBirth,
          userPlaceOfBorn,
          userBornTime,
        });

        await newUserIdToAst.save();
        await UserLogin.findByIdAndUpdate(userIdToAst, {
          $set: { chatStatus: true },
        });
        console.log(`✅ Updated chatStatus: true for userId ${userIdToAst}`);
        // ✅ Acknowledge success
        socket.emit("userId-to-astrologer-success", {
          message: "success",
          userIdsSendToAstrologer: newUserIdToAst,
        });

        // 🔔 Notify all astrologers
        io.emit("new-notification", {
          message: "You have a new chat request!",
          userId: userIdToAst,
          astrologerId: astrologerIdToAst,
          mobileNumber,
          userName,
          userDateOfBirth,
          userPlaceOfBorn,
          userBornTime,
          request_id: newUserIdToAst._id,
          requestStatus,
        });

        console.log(
          `✅ Notification emitted for chat: ${userIdToAst} ➡️ ${astrologerIdToAst}`
        );
      } catch (error) {
        console.error(
          "❌ Error saving userId and astrologerId:",
          error.message
        );
        socket.emit("userId-to-astrologer-error", {
          error: error.message,
          receivedData: messageId,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
}

module.exports = { userIdAstRoute, socketUserIdToAstrologerMsg };

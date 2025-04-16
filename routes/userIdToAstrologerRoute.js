const express = require("express");
const userIdSendToAstrologer = require("../models/userIdToAstrologerModel");
const { default: mongoose } = require("mongoose");

const userIdAstRoute = express.Router();

userIdAstRoute.put(
  "/userId-to-astrologer-astro-list-update/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { DeleteOrderHistoryStatus } = req.body;

      // Validate the request parameters
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }

      if (DeleteOrderHistoryStatus === undefined) {
        return res
          .status(400)
          .json({ error: "DeleteOrderHistoryStatus is required" });
      }

      // Update the user's status
      const updatedAstrologer = await userIdSendToAstrologer.findByIdAndUpdate(
        id,
        { $set: { DeleteOrderHistoryStatus } },
        { new: true }
      );

      if (!updatedAstrologer) {
        return res.status(404).json({ error: "User ID not found" });
      }

      res.status(200).json({
        message: "Astrologer status updated successfully",
        astrologer: updatedAstrologer,
      });
    } catch (error) {
      console.error("Error updating astrologer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

userIdAstRoute.get(
  "/userId-to-astrologer-astro-list/:userIdToAst",
  async (req, res) => {
    try {
      const astrologers = await userIdSendToAstrologer.find({
        userIdToAst: req.params.userIdToAst,
      });

      if (!astrologers || astrologers.length === 0) {
        return res
          .status(404)
          .json({ error: "No astrologers found for this userIdToAst" });
      }

      res.json(astrologers);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch astrologers", details: error.message });
    }
  }
);

userIdAstRoute.get("/userId-to-astrologer-detail/:id", async (req, res) => {
  try {
    const astrologer = await userIdSendToAstrologer.findById(req.params.id);
    res.json(astrologer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch userIdSendToAstrologer" });
  }
});

userIdAstRoute.get("/get-userId-to-astrologer", async (req, res) => {
  try {
    const userIdToAstrologer = await userIdSendToAstrologer.find();
    res.json(userIdToAstrologer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function socketUserIdToAstrologerMsg(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("astrologer-chat-status", async (astrologerData) => {
      console.log("astrologerData", astrologerData);

      io.emit("astrologer-data-received-new-notification", {
        message: "You have a new chat request!",
        astrologerData: astrologerData,
      });
    });

    // Handle userId and astrologerId submission
    socket.on("userId-to-astrologer", async (messageId) => {
      console.log("Received messageId:", messageId); 
  
      try {
        if (!messageId) {
          throw new Error("messageId object is undefined");
        }

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
        } = messageId;

        console.log("Extracted values:", {
          userIdToAst,
          astrologerIdToAst,
          mobileNumber,
          profileImage,
          astroName,
          astroCharges,
          astroExperience
        });
        if (!userIdToAst || !astrologerIdToAst) {
          throw new Error(
            `Required fields missing. userIdToAst: ${userIdToAst}, astrologerIdToAst: ${astrologerIdToAst}`
          );
        }

        if (
          !userIdToAst ||
          !astrologerIdToAst ||
          !mobileNumber ||
          !profileImage ||
          !astroName ||
          !astroCharges ||
          !astroExperience
        ) {
          throw new Error("userIdToAst and astrologerIdToAst are required");
        }

        // Save the userId and astrologerId to the database
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
        });
        await newUserIdToAst.save();

        // Emit success response to sender
        socket.emit("userId-to-astrologer-success", {
          message: "success",
          userIdsSendToAstrologer: newUserIdToAst,
        });

        // Emit notification to all connected astrologers
        io.emit("new-notification", {
          message: "You have a new chat request!",
          userId: userIdToAst,
          astrologerId: astrologerIdToAst,
          mobileNumber: mobileNumber,
        });

        console.log(
          `Notification sent to astrologers: ${userIdToAst}, ${astrologerIdToAst}`
        );
      } catch (error) {
        console.error("Error saving userId and astrologerId:", error);
        socket.emit("userId-to-astrologer-error", {
          error: "Failed to save userId and astrologerId",
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}

module.exports = { userIdAstRoute, socketUserIdToAstrologerMsg };

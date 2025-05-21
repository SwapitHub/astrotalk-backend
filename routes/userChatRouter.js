const express = require("express");
const Chat = require("../models/userChatModels");
const UserLogin = require("../models/userLoginModel");
const WalletTransaction = require("../models/transactionsUserModel");
const userIdSendToAstrologer = require("../models/userIdToAstrologerModel");
const businessProfileAstrologer = require("../models/businessProfileAstrologerModel");

const router = express.Router();

router.get("/transaction-data-astroLoger/:query", async (req, res) => {
  try {
    const { query } = req.params;
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch total count of transactions
    const totalTransactions = await WalletTransaction.countDocuments({
      astroMobile: query,
    });

    // Fetch paginated transactions
    const transactions = await WalletTransaction.find({ astroMobile: query })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // ✅ Calculate total available balance from transactionAmount
    const totalBalanceResult = await WalletTransaction.aggregate([
      { $match: { astroMobile: query } },
      {
        $group: {
          _id: null,
          totalAvailableBalance: {
            $sum: {
              $toDouble: {
                $trim: {
                  input: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: "$transactionAmount",
                              find: "₹",
                              replacement: "",
                            },
                          },
                          find: "+",
                          replacement: "",
                        },
                      },
                      find: " ",
                      replacement: "",
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    const totalAvailableBalance =
      totalBalanceResult.length > 0
        ? totalBalanceResult[0].totalAvailableBalance
        : 0;

    res.json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      hasNextPage: page * limit < totalTransactions,
      hasPrevPage: page > 1,
      totalAvailableBalance,
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.get("/WalletTransactionData", async (req, res) => {
  try {
    let { type, page, limit, user_id } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    if (!type) {
      return res
        .status(400)
        .json({ message: "Type is required (user, astrologer, or admin)" });
    }

    const validTypes = ["user", "astrologer", "admin"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Use 'user', 'astrologer', or 'admin'.",
      });
    }

    // Prepare the filter object for type and optional user_id
    const filter = { type };
    if (user_id) {
      filter.user_id = user_id; // Add user_id filter if provided
    }

    // Get total count of transactions for pagination metadata
    const totalTransactions = await WalletTransaction.countDocuments(filter);

    // Fetch paginated transactions
    const transactions = await WalletTransaction.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by latest transactions

    // Get the most recent available balance for the filtered transactions
    const lastTransaction = await WalletTransaction.findOne(filter).sort({
      createdAt: -1,
    });

    const availableBalance = lastTransaction
      ? lastTransaction.availableBalance
      : 0;

    // Calculate pagination metadata
    const hasNextPage = skip + transactions.length < totalTransactions;
    const hasPrevPage = page > 1;

    res.json({
      page,
      limit,
      totalTransactions,
      hasNextPage,
      hasPrevPage,
      availableBalance, // Add availableBalance key
      transactions,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error fetching Wallet Transactions" });
  }
});

router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

router.get("/detail/:member1/:member2", async (req, res) => {
  try {
    const { member1, member2 } = req.params;

    // Find chats where both members exist in the array
    const chat = await Chat.find({
      members: { $all: [member1, member2] },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat details" });
  }
});

// ==================
async function socketIoMessage(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("chat-timeLeft-update", async (chatTimeLeftData) => {
      console.log("chatTimeLeftDatass", chatTimeLeftData);

      if (chatTimeLeftData.totalChatTime > 0) {
        const totalMinutes = Math.ceil(chatTimeLeftData.totalChatTime / 60);
        // Calculate how many 60-second intervals have passed
        // let intervals = Math.ceil(chatTimeLeftData.totalChatTime / 60); // 1-60 => 1, 61-120 => 2, 121-180 => 3...
        // let amount = intervals * chatTimeLeftData.astrologerChargePerMinute; // Subtract 10 for each interval
        let amount = chatTimeLeftData.actualChargeUserChat;
        console.log(
          "totalamountrrr",
          typeof chatTimeLeftData.updateAdminCommission
        );
        console.log(
          "chatDuration:chatTimeL",
          chatTimeLeftData.totalChatTime,
          `${amount}`
        );

        let adminCommission =
          (amount * chatTimeLeftData.updateAdminCommission) / 100;
        let astrologerEarnings = amount - adminCommission;

        const latestOrder = await userIdSendToAstrologer
          .findOne()
          .sort({ createdAt: -1 });

        if (!latestOrder) {
          return "User order history not found";
        }

        await businessProfileAstrologer.updateOne(
          { _id: chatTimeLeftData.astrologerId },
          { $inc: { astroTotalChatTime: totalMinutes } }
        );

        const user_order_history = await userIdSendToAstrologer.updateOne(
          { _id: latestOrder._id },
          {
            $set: {
              chatType: "paid",
              chatDuration: chatTimeLeftData.totalChatTime,
              chatDeduction: `${amount}`,
              chatStatus: false,
            },
          }
        );

        if (user_order_history.modifiedCount === 0) {
          return "No records updated";
        }

        const user = await UserLogin.findByIdAndUpdate(
          chatTimeLeftData.userId,
          { $inc: { totalAmount: -amount } },
          { new: true, runValidators: true }
        );

        if (!user) {
          return socket.emit("error", { error: "User not found" });
        }

        // start WalletTransaction===========
        const userTransaction = new WalletTransaction({
          type: "user",
          user_id: chatTimeLeftData.userId,
          availableBalance: chatTimeLeftData.userAvailableBalance - amount,
          description: `Chat with ${chatTimeLeftData.astrologerName} for ${chatTimeLeftData.totalChatTime} seconds`,
          transactionAmount: `- ₹ ${amount}`,
          invoice: true,
          action: true,
          name: chatTimeLeftData.username,
        });

        await userTransaction.save();

        try {
          const lastTransaction = await WalletTransaction.findOne({
            type: "astrologer",
          }).sort({ createdAt: -1 });

          const previousBalance = lastTransaction
            ? lastTransaction.availableBalance
            : 0;
          const newBalance = previousBalance + astrologerEarnings;

          const astrologerTransaction = new WalletTransaction({
            type: "astrologer",
            astrologer_id: chatTimeLeftData.astrologerId,
            availableBalance: newBalance,
            description: `Earnings from chat with ${chatTimeLeftData.username}`,
            transactionAmount: `+ ₹ ${astrologerEarnings}`,
            invoice: true,
            action: true,
            astroMobile: chatTimeLeftData.astroMobile,
            name: chatTimeLeftData.astrologerName,
            userName: chatTimeLeftData.username,
          });
          await astrologerTransaction.save();
        } catch (error) {
          console.error("Error saving astrologer transaction:", error);
        }

        try {
          const lastTransaction = await WalletTransaction.findOne({
            type: "admin",
          }).sort({ createdAt: -1 });

          const previousBalance = lastTransaction
            ? lastTransaction.availableBalance
            : 0;
          const newBalance = previousBalance + adminCommission;

          const adminTransaction = new WalletTransaction({
            type: "admin",
            availableBalance: newBalance,
            description: `Chat with ${chatTimeLeftData.astrologerName} and ${chatTimeLeftData.username} for ${chatTimeLeftData.totalChatTime} seconds`,
            transactionAmount: `+ ₹ ${adminCommission}`,
            invoice: true,
            action: true,
            name: "Admin",
          });
          await adminTransaction.save();
        } catch (error) {
          console.error("Error saving astrologer transaction:", error);
        }

        // end WalletTransaction==================
      }

      io.emit("chat-timeLeft-update-received-new-notification", {
        message: "You have a new chat-timeLeft-update",
        chatTimeLeftData: chatTimeLeftData,
      });
    });

    // Join a specific room based on userIds and astrologerId
    socket.on("joinChat", ({ userIds, astrologerId }) => {
      const roomId = `${userIds}-${astrologerId}`;
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // Handle sending and broadcasting messages
    socket.on("sendMessage", async (msg) => {
      try {
        const { user, message, time, members } = msg;

        if (!user || !message || !members) {
          throw new Error("User and message are required");
        }

        // Save the message to the database
        const newChat = new Chat({ user, message, time, members });
        await newChat.save();

        // Broadcast the message to the specific room
        const roomId = `${members[0]}-${members[1]}`;
        io.to(roomId).emit("receiveMessage", { user, message, time, members });

        console.log(`Message sent to room: ${roomId}`);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}

module.exports = { router, socketIoMessage };

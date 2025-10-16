const WalletTransaction = require("../models/transactionsUserModel");
const Chat = require("../models/userChatModels");

const getTransactionData = async (req, res) => {
  try {
    const { query } = req.params; // This is astroMobile
    let { page, limit, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Build dynamic filter
    const filter = {
      astroMobile: query,
    };

    // Add case-insensitive userName search if provided
    if (search) {
      filter.userName = { $regex: search, $options: "i" };
    }

    // Count total matching transactions
    const totalTransactions = await WalletTransaction.countDocuments(filter);

    // Fetch paginated transactions
    const transactions = await WalletTransaction.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Aggregate total balance based on the same filter
    const totalBalanceResult = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAvailableBalance: { $sum: "$transactionAmount" },
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
};



const getWalletTransactionData = async (req, res) => {
  try {
    let { type, page, limit, user_id, search } = req.query;
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

    // 🔍 Add search filter
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search, "i");

      filter.$or = [
        { name: searchRegex },
        { userName: searchRegex },
        { description: searchRegex },
        { astroMobile: searchRegex },
      ];
    }

    // Get total count of transactions for pagination metadata
    const totalTransactions = await WalletTransaction.countDocuments(filter);

    // Fetch paginated transactions
    const transactions = await WalletTransaction.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by latest transactions

    const totalTransactionAmount = await WalletTransaction.aggregate([
      { $match: { type: "admin" } }, // Filter only admin transactions
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$transactionAmount" }, // Sum transactionAmount as Number
          count: { $sum: 1 }, // Optional: number of matched docs
        },
      },
    ]);

    const totalAmount =
      totalTransactionAmount.length > 0
        ? Number(totalTransactionAmount[0].totalAmount.toFixed(2))
        : 0;

    console.log("Total transactionAmount for admin:", totalAmount);

    // 🧮 Get latest available balance for filtered results
    const lastTransaction = await WalletTransaction.findOne(filter).sort({
      createdAt: -1,
    });

    const availableBalance = lastTransaction
      ? lastTransaction.availableBalance
      : 0;

    // 📑 Pagination data
    const hasNextPage = skip + transactions.length < totalTransactions;
    const hasPrevPage = page > 1;

    res.json({
      page,
      limit,
      totalTransactions,
      hasNextPage,
      hasPrevPage,
      availableBalance,
      transactions,
      totalAmount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Error fetching Wallet Transactions" });
  }
};

const getDetailData = async (req, res) => {
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
};

module.exports = {
  getTransactionData,
  getWalletTransactionData,
  getDetailData,
};

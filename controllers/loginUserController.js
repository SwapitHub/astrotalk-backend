const { default: mongoose } = require("mongoose");
const UserLogin = require("../models/userLoginModel");
const WalletTransaction = require("../models/transactionsUserModel");

const getAllUsersWithWallet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const matchConditions = [];

    matchConditions.push({
      "walletTransactions.0": { $exists: true },
    });

    if (search) {
      matchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
        ],
      });
    }

    // Aggregation pipeline
    const aggregatePipeline = [
      {
        $lookup: {
          from: "wallettransactions",
          localField: "_id",
          foreignField: "user_id",
          as: "walletTransactions",
        },
      },
      {
        $match: {
          $and: matchConditions,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    // Clone pipeline for count
    const countPipeline = [...aggregatePipeline, { $count: "total" }];
    const totalCountResult = await UserLogin.aggregate(countPipeline);
    const totalUsers = totalCountResult[0]?.total || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    // Add pagination
    aggregatePipeline.push({ $skip: skip }, { $limit: limit });

    // Execute paginated query
    const users = await UserLogin.aggregate(aggregatePipeline);

    return res.status(200).json({
      message: "success",
      currentPage: page,
      totalPages,
      totalUsers,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users with wallet:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllUsersWithWalletDetail = async (req, res) => {
  try {
    const phone = req.params.phone;
    const { page = 1, limit = 10, search = "" } = req.query; 

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await UserLogin.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build search filter for transactions
    let filter = { user_id: user._id };
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } }, // if transactionId field exists
        { type: { $regex: search, $options: "i" } }, // search by type (credit/debit/astro_product etc.)
        { status: { $regex: search, $options: "i" } } // search by status (success/pending/failed)
      ];
    }

    // Pagination calculation
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WalletTransaction.countDocuments(filter)
    ]);

    return res.status(200).json({
      message: "success",
      user,
      transactions,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching user wallet details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getUserLogin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page

    const skip = (page - 1) * limit;

    const totalUsers = await UserLogin.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await UserLogin.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: sort latest first

    res.json({
      users,
      page,
      limit,
      totalUsers,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Pagination error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch paginated user login data" });
  }
};

const getUserLoginDetail = async (req, res) => {
  try {
    const { query } = req.params;

    let searchCondition = { phone: query };

    if (mongoose.Types.ObjectId.isValid(query)) {
      searchCondition = { _id: new mongoose.Types.ObjectId(query) };
    }

    const loginUser = await UserLogin.findOne(searchCondition);

    if (!loginUser) {
      return res.status(404).json({ error: "Login detail not found" });
    }

    res.status(200).json({
      message: "success",
      data: loginUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user-login" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { phoneOrId } = req.params;
    const updateFields = req.body;

    if (!Object.keys(updateFields).length) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }

    // Determine if it's a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(phoneOrId);

    const query = isObjectId ? { _id: phoneOrId } : { phone: phoneOrId };

    const updatedUser = await UserLogin.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "success",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ error: "Failed to update user", details: error.message });
  }
};

const setUserLogin = async (req, res) => {
  try {
    const {
      name,
      gender,
      dateOfBirth,
      reUseDateOfBirth,
      placeOfBorn,
      language,
      phone,
      totalAmount,
      freeChatStatus,
    } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ error: "All fields except reUseDateOfBirth are required" });
    }

    const existingUser = await UserLogin.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    const newUser = new UserLogin({
      name,
      gender,
      dateOfBirth,
      reUseDateOfBirth,
      placeOfBorn,
      language,
      phone,
      totalAmount,
      freeChatStatus,
      chatStatus: false,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error during user login:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation Error", details: error.message });
    } else if (error.name === "MongoError") {
      return res
        .status(500)
        .json({ error: "Database Error", details: error.message });
    } else {
      return res
        .status(500)
        .json({ error: "Failed to process request", details: error.message });
    }
  }
};

module.exports = {
  getUserLogin,
  getUserLoginDetail,
  updateUser,
  setUserLogin,
  getAllUsersWithWallet,
  getAllUsersWithWalletDetail,
};

const AstrologerRegistration = require("../models/astrologerRegistrationModel");
const fs = require("fs");
const path = require("path");
const businessProfileAstrologer = require("../models/businessProfileAstrologerModel");
const WalletTransaction = require("../models/transactionsUserModel");
// ✅ Get List of Astrologers (Filter by astroStatus)

const getAllAstrologersWithWallet = async (req, res) => {
 try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const matchConditions = [];

    matchConditions.push({
      "walletTransactions.0": { $exists: true },
    });

    matchConditions.push({ deleteAstroLoger: false });
    
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
          foreignField: "astrologer_id",
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
    const totalCountResult = await businessProfileAstrologer.aggregate(countPipeline);
    const totalUsers = totalCountResult[0]?.total || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    // Add pagination
    aggregatePipeline.push({ $skip: skip }, { $limit: limit });

    // Execute paginated query
    const users = await businessProfileAstrologer.aggregate(aggregatePipeline);

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


const getAllAstrologersWithWalletDetail = async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const { page = 1, limit = 10, search = "" } = req.query; 

    if (!mobileNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const astrologer = await businessProfileAstrologer.findOne({ mobileNumber });

    if (!astrologer) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build search filter for transactions
    let filter = { astrologer_id: astrologer._id };
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
      astrologer,
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

const getAstrologerList = async (req, res, next) => {
  try {
    const { astroStatus, page = 1, limit = 10, search = "" } = req.query;

    if (astroStatus === undefined) {
      return res
        .status(400)
        .json({ error: "astroStatus query parameter is required" });
    }

    const statusFilter = astroStatus === "true";
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);

    // Base filter
    const filter = {
      astroStatus: statusFilter,
      deleteAstroLoger: false,
    };

    // If search query is present, add regex condition
    if (search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { mobileNumber: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const totalAstrologers = await AstrologerRegistration.countDocuments(
      filter
    );

    const astrologers = await AstrologerRegistration.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const totalPages = Math.ceil(totalAstrologers / itemsPerPage);

    res.status(200).json({
      astrologers,
      totalAstrologers,
      page: currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAstrologerList = async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const astrologer = await AstrologerRegistration.findOne({ mobileNumber });

    if (!astrologer) {
      return res.status(404).json({ error: "Astrologer not found" });
    }

    await AstrologerRegistration.deleteOne({ mobileNumber });

    res.status(200).json({
      success: true,
      message: "Astrologer deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Astrologer by ID
const getAstrologerDetail = async (req, res, next) => {
  try {
    const { mobileNumber } = req.params;

    const astrologer = await AstrologerRegistration.findOne({
      mobileNumber,
      // astroStatus: true,
    });

    if (!astrologer) {
      return res.status(404).json({ error: "Astrologer not found" });
    }
    res.status(200).json({
      success: true,
      message: "success",
      data: astrologer,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Register New Astrologer
const registerAstrologer = async (req, res, next) => {
  try {
    const {
      name,
      dateOfBirth,
      gender,
      languages,
      skills,
      deviceUse,
      email,
      astroStatus,
      mobileNumber,
    } = req.body;

    if (
      !name ||
      !dateOfBirth ||
      !gender ||
      !languages ||
      !skills ||
      !deviceUse ||
      !email ||
      astroStatus === undefined ||
      !mobileNumber
    ) {
      return res
        .status(400)
        .json({ error: "All astrologer data are required" });
    }

    const existingAstrologer = await AstrologerRegistration.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingAstrologer) {
      return res
        .status(400)
        .json({ error: "Email or mobile number already registered" });
    }

    const aadhaarCard = req.files?.aadhaarCard?.[0]?.filename
      ? `/public/uploads/${req.files.aadhaarCard[0].filename}`
      : null;

    const certificate = req.files?.certificate?.[0]?.filename
      ? `/public/uploads/${req.files.certificate[0].filename}`
      : null;

    const newAstrologer = new AstrologerRegistration({
      name,
      dateOfBirth,
      gender,
      languages,
      skills,
      deviceUse,
      email,
      astroStatus,
      mobileNumber,
      blockUnblockAstro: false,
      deleteAstroLoger: false,
      completeProfile: false,
      aadhaarCard,
      certificate,
    });

    await newAstrologer.save();

    res.status(201).json({
      message: "success",
      astrologer: newAstrologer,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Astrologer Status
const updateAstroStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Optional: Validate that `updateFields` is not empty
    if (!updateFields || Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }

    // Convert "true"/"false" strings to boolean if necessary
    if (updateFields.astroStatus !== undefined) {
      updateFields.astroStatus =
        updateFields.astroStatus === true ||
        updateFields.astroStatus === "true";
    }

    const updatedAstrologer = await AstrologerRegistration.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedAstrologer) {
      return res.status(404).json({ error: "Astrologer not found" });
    }

    res.status(200).json({
      message: "Astrologer updated successfully",
      astrologer: updatedAstrologer,
    });
  } catch (error) {
    next(error);
  }
};

const updateAstroAnyField = async (req, res) => {
  const mobileNumber = req.params.mobileNumber;

  try {
    const files = req.files;
    let updateData = { ...req.body };

    // Handle languages (parse if stringified)
    if (updateData.languages) {
      try {
        updateData.languages = JSON.parse(updateData.languages);
      } catch {
        updateData.languages = Array.isArray(updateData.languages)
          ? updateData.languages
          : [updateData.languages];
      }
    }

    // Fetch current astrologer
    const existingProfile = await AstrologerRegistration.findOne({
      mobileNumber,
    });
    if (!existingProfile) {
      return res.status(404).json({ message: "Astrologer not found." });
    }

    const removeOldFile = (filePath) => {
      const fullPath = path.join(__dirname, "../", filePath); // go one level up
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    };

    // Aadhaar Card
    if (files?.aadhaarCard) {
      if (existingProfile.aadhaarCard) {
        removeOldFile(existingProfile.aadhaarCard);
      }

      updateData.aadhaarCard = `/public/uploads/${files.aadhaarCard[0].filename}`;
    }

    // Certificate
    if (files?.certificate) {
      if (existingProfile.certificate) {
        removeOldFile(existingProfile.certificate);
      }

      updateData.certificate = `/public/uploads/${files.certificate[0].filename}`;
    }

    // Profile Image
    if (files?.profileImage) {
      if (existingProfile.profileImage) {
        removeOldFile(existingProfile.profileImage);
      }

      updateData.profileImage = `/public/uploads/${files.profileImage[0].filename}`;
    }

    // Final DB update
    const updatedAstrologer = await AstrologerRegistration.findOneAndUpdate(
      { mobileNumber },
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: "success",
      data: updatedAstrologer,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

module.exports = {
  getAstrologerList,
  getAstrologerDetail,
  registerAstrologer,
  updateAstroStatus,
  deleteAstrologerList,
  updateAstroAnyField,
  getAllAstrologersWithWallet,
  getAllAstrologersWithWalletDetail
};

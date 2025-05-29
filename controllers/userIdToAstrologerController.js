const { default: mongoose } = require("mongoose");
const userIdSendToAstrologer = require("../models/userIdToAstrologerModel");

const updateUserIdToAstrologer = async (req, res) => {
  try {
    const {
      id,
      DeleteOrderHistoryStatus,
      profileStatus,
      mobileNumber,
      chatStatus,
    } = req.body;
    let updateResults = {};

    // Update DeleteOrderHistoryStatus by ID
    if (DeleteOrderHistoryStatus !== undefined) {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Valid user ID required for DeleteOrderHistoryStatus",
        });
      }

      const deleteStatusUpdate = await userIdSendToAstrologer.findByIdAndUpdate(
        id,
        { $set: { DeleteOrderHistoryStatus } },
        { new: true }
      );

      if (!deleteStatusUpdate) {
        return res.status(404).json({ error: "User not found by ID" });
      }

      updateResults.DeleteOrderHistoryStatus = deleteStatusUpdate;
    }

    // Update profileStatus for all users with same mobileNumber
    if (profileStatus !== undefined && mobileNumber) {
      const profileStatusUpdate = await userIdSendToAstrologer.updateMany(
        { mobileNumber },
        { $set: { profileStatus } }
      );

      if (profileStatusUpdate.modifiedCount === 0) {
        return res
          .status(404)
          .json({ error: "No users found with this mobile number" });
      }

      updateResults.profileStatus = `${profileStatusUpdate.modifiedCount} documents updated`;
    }

    // Update chatStatus for all users with same mobileNumber
    if (chatStatus !== undefined && mobileNumber) {
      const chatStatusUpdate = await userIdSendToAstrologer.updateMany(
        { mobileNumber },
        { $set: { chatStatus } }
      );

      if (chatStatusUpdate.modifiedCount === 0) {
        return res
          .status(404)
          .json({ error: "No users found with this mobile number" });
      }

      updateResults.chatStatus = `${chatStatusUpdate.modifiedCount} documents updated`;
    }

    if (Object.keys(updateResults).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields or identifiers provided" });
    }

    res.status(200).json({
      message: "Update successful",
      updates: updateResults,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserIdToAstrologer = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const astrologers = await userIdSendToAstrologer
      .find({ userIdToAst: req.params.userIdToAst })
      .skip(skip)
      .sort({ _id: -1 })
      .limit(parseInt(limit));

    const total = await userIdSendToAstrologer.countDocuments({
      userIdToAst: req.params.userIdToAst,
    });

    res.json({
      data: astrologers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      hasMore: skip + astrologers.length < total,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch astrologers",
      details: error.message,
    });
  }
};

const getUserIdToAstrologerDetail = async (req, res) => {
  try {
    const astrologer = await userIdSendToAstrologer.findById(req.params.id);
    res.json(astrologer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch userIdSendToAstrologer" });
  }
};

const getSendUserIdToAst = async (req, res) => {
  try {
    const userIdToAstrologer = await userIdSendToAstrologer.find();
    res.json(userIdToAstrologer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  updateUserIdToAstrologer,
  getUserIdToAstrologer,
  getUserIdToAstrologerDetail,
  getSendUserIdToAst
};

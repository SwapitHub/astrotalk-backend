const AstrologerRegistration = require("../models/astrologerRegistrationModel");

// ✅ Get List of Astrologers (Filter by astroStatus)
const getAstrologerList = async (req, res, next) => {
  try {
    const { astroStatus, page = 1, limit = 10 } = req.query;

    if (astroStatus === undefined) {
      return res
        .status(400)
        .json({ error: "astroStatus query parameter is required" });
    }

    const statusFilter = astroStatus === "true";
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);

    const totalAstrologers = await AstrologerRegistration.countDocuments({
      astroStatus: statusFilter,
    });

    const astrologers = await AstrologerRegistration.find({
      astroStatus: statusFilter,
    })
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

// ✅ Get Astrologer by ID
const getAstrologerDetail = async (req, res, next) => {
  try {
    const { mobileNumber } = req.params;

    const astrologer = await AstrologerRegistration.findOne({
      mobileNumber,
      astroStatus: true,
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

    const aadhaarCard = req.files?.aadhaarCard?.[0]?.path || null;
    const certificate = req.files?.certificate?.[0]?.path || null;

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

module.exports = {
  getAstrologerList,
  getAstrologerDetail,
  registerAstrologer,
  updateAstroStatus,
};

const mongoose = require("mongoose");

const userIdSendToAstrologerSchema = new mongoose.Schema(
  {
    userIdToAst: String,
    astrologerIdToAst: String,
    mobileNumber: String,
    profileImage: String,
    astroName: String,
    astroCharges: String,
    astroExperience: String,
    chatId: String,
    chatType: String,
    chatDuration: String,
    chatDeduction: String,
    DeleteOrderHistoryStatus: Boolean,
    chatStatus: Boolean,
    profileStatus: Boolean,
    userName: String,
    userDateOfBirth: String,
    userPlaceOfBorn: String,
    userBornTime: String,
  },
  { timestamps: true }
);
const userIdSendToAstrologer = mongoose.model(
  "UserIdSendToAstrologer",
  userIdSendToAstrologerSchema
);
module.exports = userIdSendToAstrologer;

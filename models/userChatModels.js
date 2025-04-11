const  mongoose  = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: String,
  message: String,
  time: String,
  chatStartStatus : Boolean,
   members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
      ],
});
const Chat = mongoose.model("Chat", chatSchema);


module.exports = Chat
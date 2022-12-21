const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversationModel = new Schema(
  {
    name: String,
    avatar: String,
    receiver: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    text: String,
    call: Object,
    isRead: [{ type: mongoose.Types.ObjectId }],
    type: {
      type: String,
      enum: ["group", "single"],
    },
    admin: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationModel);

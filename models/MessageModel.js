const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageModel = new Schema(
  {
    conversation: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.SchemaTypes.ObjectId,
    },
    text: String,
    images: [
      {
        type: String,
      },
    ],
    videos: [
      {
        type: String,
      },
    ],
    call: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageModel);

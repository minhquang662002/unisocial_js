const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notificationSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    receiver: [{ type: mongoose.Types.ObjectId }],
    url: String,
    text: String,
    readBy: [{ type: mongoose.Types.ObjectId }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

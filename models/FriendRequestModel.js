const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const friendRequestSchema = new Schema(
  {
    sender: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.SchemaTypes.ObjectId,
    },
    status: {
      type: String,
      enum: ["accepted", "pending", "rejected"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FriendRequest", friendRequestSchema);

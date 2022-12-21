const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PostSchema = new Schema(
  {
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    tags: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
    text: {
      type: String,
    },
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
    likes: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
    comments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);

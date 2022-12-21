const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentModel = new Schema(
  {
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    post: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Post",
    },
    tags: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
    text: {
      type: String,
      maxlength: 500,
    },
    image: {
      type: String,
    },

    video: {
      type: String,
    },

    likes: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
    reply: mongoose.SchemaTypes.ObjectId,
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentModel);

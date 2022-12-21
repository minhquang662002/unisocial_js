const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const StorageModel = new Schema({
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "users",
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
  posts: [
    {
      type: String,
      ref: "Post",
    },
  ],
});

module.exports = mongoose.model("Storage", StorageModel);

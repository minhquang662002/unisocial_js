const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dd0w757jk/image/upload/v1654678362/unisocial/defaultAvatar_f08mtv.jpg",
    },
    background: {
      type: String,
      default:
        "https://res.cloudinary.com/dd0w757jk/image/upload/v1654678361/unisocial/defaultBg_p2fg2w.jpg",
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    friends: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

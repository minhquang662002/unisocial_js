const Comment = require("../models/CommentModel");
const Post = require("../models/PostModel");
const commentCtrl = {
  createComment: async (req, res) => {
    try {
      const { text, image, video } = req.body;
      const { id } = req.id;
      const { postID } = req.params;
      const { commentID } = req.query;
      if (!text && !Object.keys(image).length && !Object.keys(video).length) {
        return res.status(400).json("No content!");
      }
      let newComment;
      if (commentID) {
        newComment = new Comment({
          owner: id,
          post: postID,
          text,
          image,
          video,
          reply: commentID,
        });
        await Comment.findByIdAndUpdate(commentID, {
          $inc: { replyCount: 1 },
        });
      } else {
        newComment = new Comment({
          owner: id,
          post: postID,
          text,
          image,
          video,
        });
        await Post.findByIdAndUpdate(postID, {
          $inc: { comments: 1 },
        });
      }
      await newComment.save();

      const returnedComment = await newComment.populate(
        "owner",
        "-password -gender -birthday -email"
      );
      const finalComment = await returnedComment.populate({
        path: "post",
        select: "_id",
        populate: { path: "owner", select: "_id friends" },
      });
      return res.status(200).json(finalComment);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  getComments: async (req, res) => {
    try {
      const { post } = req.query;
      const { page = 0 } = req.query;
      const comments = await Comment.find({
        post,
        reply: { $exists: false },
      })
        .limit(10)
        .skip(page * 10)
        .sort("-createdAt")
        .populate("owner", "-password -gender -birthday -email")
        .populate({
          path: "post",
          select: "_id",
          populate: { path: "owner", select: "_id" },
        });
      return res.status(200).json(comments);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  getReplies: async (req, res) => {
    try {
      const { commentID } = req.params;
      const { page } = req.query;
      const replies = await Comment.find({
        reply: commentID,
      })
        .limit(10)
        .skip(page * 10)
        .populate("owner", "-password -gender -birthday -email")
        .populate({
          path: "post",
          select: "_id",
          populate: { path: "owner", select: "_id" },
        });
      return res.status(200).json(replies);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  editComment: async (req, res) => {
    try {
      const { text, image, video } = req.body;
      const { id } = req.query;
      const editComment = await Comment.findByIdAndUpdate(
        id,
        {
          text,
          image,
          video,
        },
        { new: true }
      )
        .populate("owner", "-password -gender -birthday -email")
        .populate({
          path: "post",
          select: "_id",
          populate: { path: "owner", select: "_id" },
        });

      return res.status(200).json(editComment);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  deleteComment: async (req, res) => {
    try {
      const { postID } = req.query;
      const { commentID } = req.params;
      await Comment.findByIdAndDelete(commentID);
      await Post.findByIdAndUpdate(postID, {
        $inc: {
          comments: -1,
        },
      });
      return res.status(200).json("deleted");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  likeComment: async (req, res) => {
    try {
      const { commentID } = req.params;
      const { id } = req.id;
      await Comment.findByIdAndUpdate(commentID, {
        $push: {
          likes: id,
        },
      });
      return res.status(200).json("Liked");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  unlikeComment: async (req, res) => {
    try {
      const { commentID } = req.params;
      const { id } = req.id;
      await Comment.findByIdAndUpdate(commentID, {
        $pull: {
          likes: id,
        },
      });
      return res.status(200).json("Unliked");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
};

module.exports = commentCtrl;

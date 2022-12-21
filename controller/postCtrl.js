const { default: mongoose } = require("mongoose");
const Post = require("../models/PostModel");
const User = require("../models/UserModel");
const Comment = require("../models/CommentModel");
const Storage = require("../models/StorageModel");

const postCtrl = {
  getPublicPost: async (req, res) => {
    try {
      const { id } = req.id;
      const loggedUser = await User.findById(id);
      const friendList = loggedUser.friends.map((item) =>
        mongoose.Types.ObjectId(item)
      );
      const page = req.query.page || 0;
      const posts = await Post.aggregate([
        {
          $match: {
            owner: { $in: [...friendList, mongoose.Types.ObjectId(id)] },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  email: 0,
                  password: 0,
                  birthday: 0,
                  gender: 0,
                },
              },
            ],
          },
        },
        {
          $unwind: "$owner",
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $facet: {
            result: [{ $skip: page * 10 }, { $limit: 10 }],
            totalCount: [{ $count: "count" }],
          },
        },
        { $unwind: "$totalCount" },
      ]);
      console.log(posts);
      return res.status(200).json(posts[0]);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  getUserPost: async (req, res) => {
    try {
      const { id } = req.query?.id ? req.query : req.id;
      const page = req.query?.page || 0;
      const posts = await Post.aggregate([
        {
          $match: {
            $or: [
              { owner: mongoose.Types.ObjectId(id) },
              {
                tags: {
                  $in: [mongoose.Types.ObjectId(id)],
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  email: 0,
                  password: 0,
                  birthday: 0,
                  gender: 0,
                },
              },
            ],
          },
        },
        {
          $unwind: "$owner",
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $facet: {
            result: [{ $skip: page * 10 }, { $limit: 10 }],
            totalCount: [{ $count: "count" }],
          },
        },
        { $unwind: "$totalCount" },
      ]);
      return res.status(200).json(posts[0]);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },

  getSpecificPost: async (req, res) => {
    try {
      const { postID } = req.params;
      const post = await Post.findById(postID);
      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },

  createPost: async (req, res) => {
    try {
      const { id } = req.id;
      const { text, images, videos } = req.body;
      if (!text && !images && !videos) {
        return res.status(400).json("No content!");
      }
      // if (images?.length > 0 || videos?.length > 0) {
      //   await Storage.findOneAndUpdate(
      //     { owner: id },
      //     {
      //       $push: {
      //         images: {
      //           $each: images,
      //         },
      //         videos: {
      //           $each: videos,
      //         },
      //       },
      //     },
      //     { upsert: true }
      //   );
      // }
      const newPost = new Post({
        owner: id,
        text,
        images,
        videos,
      });
      await newPost.save();
      const returnedPost = await newPost.populate(
        "owner",
        "-email -password -birthday -gender"
      );
      return res
        .status(200)
        .json({ message: "Created post successffuly!", post: returnedPost });
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  deletePost: async (req, res) => {
    try {
      const postID = req.params.id;
      const { id } = req.id;
      const deletedPost = await Post.findOneAndDelete({
        owner: id,
        _id: postID,
      });
      await Comment.deleteMany({
        post: postID,
      });
      if (deletedPost) {
        return res.status(200).json("Deleted!");
      } else {
        return res.status(400).json("Can't find post");
      }
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  updatePost: async (req, res) => {
    try {
      const postID = req.params.id;
      const { id } = req.id;
      const data = req.body;
      await Post.findOneAndUpdate(
        {
          owner: id,
          _id: postID,
        },
        data
      );
      return res.status(200).json("Updated!");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  likePost: async (req, res) => {
    try {
      const { id } = req.id;
      const postID = req.params.id;

      await Post.updateOne({ _id: postID }, [
        {
          $set: {
            likes: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $setIntersection: ["$likes", [id]],
                      },
                    },
                    0,
                  ],
                },
                then: { $concatArrays: [[], "$likes"] },
                else: { $concatArrays: [[id], "$likes"] },
              },
            },
          },
        },
      ]);
      return res.status(200).json("Liked");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  unlikePost: async (req, res) => {
    try {
      const { id } = req.id;
      const postID = req.params.id;
      await Post.findByIdAndUpdate(postID, {
        $pull: {
          likes: id,
        },
      });
      return res.status(200).json("Unliked");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  savePost: async (req, res) => {
    try {
      const { id } = req.id;
      const { postID } = req.params;
      const existRecord = await Storage.find({
        owner: id,
        posts: { $in: [postID] },
      });
      if (existRecord.length > 0) {
        return res.status(400).json("This post has already been saved!");
      } else {
        await Storage.findOneAndUpdate(
          { owner: id },
          {
            $push: {
              posts: postID,
            },
          },
          { upsert: true }
        );
      }
      return res.status(200).json("Saved post!");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  unsavePost: async (req, res) => {
    try {
      const { id } = req.id;
      const { postID } = req.params;

      await Storage.findOneAndUpdate(
        { owner: id },
        {
          $pull: {
            posts: postID,
          },
        }
      );

      return res.status(200).json("Unsaved post!");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  getSavedPosts: async (req, res) => {
    try {
      const { id } = req.id;
      const page = req.query.page || 0;
      const savedPosts = await Storage.find({
        owner: id,
      })
        .populate({
          path: "posts",
          populate: {
            path: "owner",
            select: "_id firstName lastName avatar friends",
          },
        })
        .select("posts")
        .limit(10)
        .skip(page * 10);
      return res.status(200).json(savedPosts[0]);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
};

module.exports = postCtrl;

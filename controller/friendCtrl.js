const FriendRequest = require("../models/FriendRequestModel");
const User = require("../models/UserModel");
const friendCtrl = {
  getRequests: async (req, res) => {
    try {
      const { id } = req.id;
      const { page = 0 } = req.query;

      const requests = await FriendRequest.find({
        receiver: id,
        status: "pending",
      })
        .populate("sender", "-password -birthday")
        .limit(10)
        .skip(page * 10);

      return res.status(200).json(requests);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  existRequest: async (req, res) => {
    try {
      const { id } = req.id;
      const { user } = req.params;
      const existRequest = await FriendRequest.findOne({
        $and: [
          {
            $or: [
              { sender: id, receiver: user },
              {
                sender: user,
                receiver: id,
              },
            ],
          },
          { status: "pending" },
        ],
      }).populate("sender", "_id");
      if (existRequest) {
        return res.status(200).json(existRequest);
      }
      return res.status(200);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  getSuggestions: async (req, res) => {
    try {
      const user = await User.findById(req.id.id);
      const sendedRequest = await FriendRequest.find({
        $or: [{ sender: user }, { receiver: user }],
        status: "pending",
      });
      const excludedUsers = sendedRequest.reduce((prev, cur) => {
        if (cur.sender !== user) {
          prev.push(cur.sender);
        }
        if (cur.receiver !== user) {
          prev.push(cur.receiver);
        }
        return prev;
      }, []);
      const excludeList = [...user.friends, ...excludedUsers, req.id.id];
      const page = req.query.page || 0;
      const suggests = await User.find({ _id: { $nin: excludeList } })
        .select("-password")
        .limit(12)
        .skip(page * 12);
      return res.status(200).json(suggests);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },

  sendRequest: async (req, res) => {
    try {
      const { id } = req.id;
      const { receiver } = req.body;
      const isExists = await FriendRequest.findOne({
        $and: [
          {
            $or: [
              { sender: id, receiver },
              { sender: receiver, receiver: id },
            ],
          },
          {
            $or: [
              {
                status: "pending",
              },
              { status: "accepted" },
            ],
          },
        ],
      });
      if (isExists) {
        return res.status(400).json("Already send!");
      }
      const newRequest = new FriendRequest({
        sender: id,
        receiver,
        status: "pending",
      });
      await newRequest.save();
      const newData = await newRequest.populate(
        "sender",
        "-password -birthday"
      );
      return res.status(200).json([newData]);
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  acceptRequest: async (req, res) => {
    try {
      const { id } = req.id;
      const { sender } = req.body;
      const { requestID } = req.params;
      const sendedRequest = await FriendRequest.findById(requestID);
      if (!sendedRequest) {
        return res.status(400).json("Request not available");
      }
      await FriendRequest.findByIdAndUpdate(requestID, {
        $set: {
          status: "accepted",
        },
      });

      await User.findByIdAndUpdate(id, {
        $push: {
          friends: sender,
        },
      });
      await User.findByIdAndUpdate(sender, {
        $push: {
          friends: id,
        },
      });
      return res.status(200).json("accepted");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  cancelRequest: async (req, res) => {
    try {
      const { requestID } = req.params;
      await FriendRequest.findByIdAndDelete(requestID);
      return res.status(200).json("Cancelled");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
  unfriend: async (req, res) => {
    try {
      const { id } = req.id;
      const { userID } = req.params;
      await FriendRequest.findOneAndDelete({
        $and: [
          {
            $or: [
              { sender: id, receiver: userID },
              { sender: userID, receiver: id },
            ],
          },
          {
            $or: [
              {
                status: "pending",
              },
              { status: "accepted" },
            ],
          },
        ],
      });
      await User.findByIdAndUpdate(id, {
        $pull: {
          friends: userID,
        },
      });
      await User.findByIdAndUpdate(userID, {
        $pull: {
          friends: id,
        },
      });

      return res.status(200).json("Unfriend");
    } catch (error) {
      return res.status(500).json("Internal server error!");
    }
  },
};

module.exports = friendCtrl;

const { default: mongoose } = require("mongoose");
const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");

const messageCtrl = {
  getConversations: async (req, res) => {
    try {
      const { id } = req.id;
      const conversations = await Conversation.find({ $in: [id] }).populate(
        "receiver",
        "_id avatar firstName lastName"
      );

      return res.status(200).json(conversations);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },

  getGroupConversations: async (req, res) => {
    try {
      const { id } = req.id;
      const groups = await Conversation.find({
        $and: [{ receiver: { $in: [id] } }, { type: "group" }],
      }).populate("receiver", "_id avatar firstName lastName");

      return res.status(200).json(groups);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  getSingleMessages: async (req, res) => {
    try {
      const { id } = req.id;
      const page = req.query.page || 0;
      const { userID } = req.params;
      const conve = await Conversation.findOne({
        $or: [{ receiver: [id, userID] }, { receiver: [userID, id] }],
      });
      if (!conve) return res.status(200).json([]);
      const messages = await Message.find({
        conversation: conve._id,
      })
        .sort("-createdAt")
        .skip(page * 15)
        .limit(15)
        .populate("sender", "-password -gender -email -address");
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  getGroupMessages: async (req, res) => {
    try {
      const page = req.query.page || 0;
      const { groupID } = req.params;
      const conve = await Conversation.findById(groupID);
      if (!conve) return res.status(200).json([]);
      const messages = await Message.find({
        conversation: conve._id,
      })
        .sort("-createdAt")
        .skip(page * 15)
        .limit(15)
        .populate("sender", "-password -gender -email -address");
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  createGroupChat: async (req, res) => {
    try {
      const { id } = req.id;
      const { name, members, avatar } = req.body;

      if (members.length < 2 || members.length > 9) return;
      if (!name) return;
      const newGroup = new Conversation({
        name,
        receiver: [id, ...members],
        avatar,
        type: "group",
        admin: id,
      });
      await newGroup.save();
      return res.status(200).json(newGroup);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  sendMessage: async (req, res) => {
    try {
      const { id } = req.id;
      const { receiver, text, videos, images, call, conveID, type, sender } =
        req.body;
      const trueSender = sender || id;
      if (
        !receiver ||
        (!text?.trim().length && !videos?.length && !images?.length && !call)
      )
        return;
      let newConversation;
      let newMessage;
      if (!conveID) {
        if (call) {
          newConversation = await Conversation.findOneAndUpdate(
            {
              $or: [
                { receiver: [trueSender, receiver] },
                { receiver: [receiver, trueSender] },
              ],
            },
            {
              receiver: [trueSender, receiver],
              text,
              images,
              videos,
              call,
              type,
            },
            { new: true, upsert: true }
          ).populate("receiver");
        } else {
          newConversation = await Conversation.findOneAndUpdate(
            {
              $or: [
                { receiver: [trueSender, receiver] },
                { receiver: [receiver, trueSender] },
              ],
            },
            {
              receiver: [trueSender, receiver],
              text,
              images,
              videos,
              $unset: {
                call: "",
              },
              type,
            },
            { new: true, upsert: true }
          ).populate("receiver");
        }
        newMessage = new Message({
          conversation: newConversation._id,
          sender: trueSender,
          receiver,
          text,
          call,
          images,
          videos,
        });
      } else {
        const isInGroup = await Conversation.find({
          $and: [
            { _id: conveID },
            {
              receiver: {
                $in: [id],
              },
            },
          ],
        });
        if (!isInGroup.length)
          return res.status(400).json("You are not in group!");
        await Conversation.findByIdAndUpdate(conveID, {
          $pull: { receiver: id },
        });

        newConversation = await Conversation.findByIdAndUpdate(
          conveID,
          {
            $push: {
              receiver: { $each: [id], $position: 0 },
            },
            text,
            images,
            videos,
            call,
            type,
          },
          { new: true, upsert: true }
        ).populate("receiver");

        newMessage = new Message({
          conversation: newConversation._id,
          sender: trueSender,
          text,
          images,
          videos,
          call,
        });
      }
      await newMessage.save();
      const returnedMsg = await newMessage.populate(
        "sender",
        "-password -gender -email -address"
      );
      const finalReturnedMsg = await returnedMsg.populate(
        "conversation",
        "_id receiver"
      );
      return res.status(200).json(finalReturnedMsg);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  addMember: async (req, res) => {
    try {
      const { member } = req.body;
      const { groupID } = req.params;
      const finded = await Conversation.findById(groupID);
      if (finded.receiver.length > 10) {
        return res.status(400).json("Exceed group's size!");
      }
      await Conversation.findByIdAndUpdate(groupID, {
        $push: { receiver: { $each: member } },
      });
      return res.status(200).json("Added");
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },

  removeGroupChatMember: async (req, res) => {
    try {
      const { groupID } = req.params;
      const { memberID } = req.query;
      const { adminID } = req.body;
      if (req.id.id !== adminID) {
        return res.status(400).json("You are not the admin of group");
      }
      await Conversation.findByIdAndUpdate(groupID, {
        $pull: { receiver: memberID },
      });
      return res.status(200).json("Removed");
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },

  deleteGroupChat: async (req, res) => {
    try {
      const { groupID } = req.params;

      const deleteGroup = await Conversation.findById(groupID);

      if (deleteGroup.admin.toString() !== req.id.id) {
        return res.status(400).json("You are not the admin of group");
      }

      await Conversation.findByIdAndDelete(groupID);
      return res.status(200).json("Deleted");
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },

  leaveGroup: async (req, res) => {
    try {
      const { id } = req.id;
      const { groupID } = req.params;
      await Conversation.findByIdAndUpdate(groupID, {
        $pull: { receiver: id },
      });
      return res.status(200).json("Leave");
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
};

module.exports = messageCtrl;

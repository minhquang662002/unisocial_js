const Notification = require("../models/NotificationModel");
const notificationCtrl = {
  createNotification: async (req, res) => {
    try {
      const { id } = req.id;
      const { receiver, url, text } = req.body;
      const ntf = new Notification({
        user: id,
        receiver,
        url,
        text,
      });
      await ntf.save();
      const returnedNtf = await ntf.populate(
        "user",
        "_id avatar firstName lastName"
      );
      return res.status(200).json(returnedNtf);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  getNotifications: async (req, res) => {
    try {
      const { id } = req.id;
      const { fetch, type } = req.query;
      const limit = fetch === "all" ? 0 : 15;
      let ntfs;
      if (type != "unread") {
        ntfs = await Notification.find({ receiver: { $in: [id] } })
          .sort("-createdAt")
          .limit(limit)
          .populate("user", "_id avatar firstName lastName");
      } else {
        ntfs = await Notification.find({
          $and: [
            { receiver: { $in: [req.id.id] } },
            { readBy: { $nin: [req.id.id] } },
          ],
        }).populate("user", "_id avatar firstName lastName");
      }

      return res.status(200).json(ntfs);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },

  getUnread: async (req, res) => {
    try {
      return res.status(200).json(unread);
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },

  readNotification: async (req, res) => {
    try {
      const { ntfID } = req.params;
      await Notification.findByIdAndUpdate(ntfID, {
        $push: { readBy: req.id.id },
      });
      return res.status(200).json("Read");
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  readAllNotifications: async (req, res) => {
    try {
      await Notification.updateMany(
        {
          $and: [
            {
              receiver: { $in: [req.id.id] },
            },
            { readBy: { $nin: [req.id.id] } },
          ],
        },
        { $push: { readBy: req.id.id } }
      );
      return res.status(200).json("Read");
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
  // updateNotification: async (req, res) => {
  //   try {
  //     await Notification.findOneAndDelete({
  //       _id: req.params.id,
  //     }, { new: true, upsert: true });
  //   } catch (error) {
  //     return res.status(500).json({ success: false, message: error });
  //   }
  // },

  deleteAllNotifications: async (req, res) => {
    try {
      await Notification.updateMany(
        { receiver: { $in: [req.id.id] } },
        { $pull: { receiver: req.id.id } }
      );
      return res.status(200).json("Deleted");
    } catch (error) {
      return res.status(500).json("Internal server error");
    }
  },
};

module.exports = notificationCtrl;

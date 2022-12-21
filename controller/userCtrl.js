const User = require("../models/UserModel");

const userCtrl = {
  getInfo: async (req, res) => {
    try {
      const { id } = req.query?.id ? req.query : req.id;
      const info = await User.findById(id)
        .select("-password")
        .populate("friends", "-password -email");
      return res.status(200).json(info);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error!" });
    }
  },
  searchUser: async (req, res) => {
    try {
      const { q, limit } = req.query;
      const data = await User.find({
        $or: [
          { firstName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
        ],
      })
        .limit(limit)
        .select("-password");

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error!" });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { id } = req.id;
      const data = req.body;
      await User.findByIdAndUpdate(id, data);
      return res.status(200).json("Update successfully");
    } catch (error) {
      return res.status(500).json({ message: "Internal server error!" });
    }
  },
};

module.exports = userCtrl;

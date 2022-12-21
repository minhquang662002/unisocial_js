const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authCtrl = {
  register: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirm_password,
        birthday,
        address,
        gender,
      } = req.body;

      if (
        !password ||
        !firstName ||
        !lastName ||
        !email ||
        !gender ||
        !birthday ||
        !password ||
        !confirm_password
      ) {
        return res.status(400).json({ message: "Missing field" });
      }

      if (password !== confirm_password) {
        return res.status(400).json({ message: "Password is not matched" });
      }

      const existedEmail = await User.findOne({ email });

      if (existedEmail) {
        return res
          .status(400)
          .json({ message: "This email has already existed!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        address,
        gender,
        birthday,
      });
      await newUser.save();
      const accessToken = jwt.sign(
        { id: newUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        { id: newUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
      });

      return res
        .status(200)
        .json({ message: "Register successffuly!", accessToken });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const existedEmail = await User.findOne({ email });
      if (!existedEmail)
        return res
          .status(400)
          .json({ message: "This account does not exist!" });

      const isCorrect = await bcrypt.compare(password, existedEmail.password);
      if (!isCorrect)
        return res
          .status(400)
          .json({ message: "Email or password is incorrect!" });

      const accessToken = jwt.sign(
        { id: existedEmail._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        { id: existedEmail._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
      });

      res.status(200).json({ message: "Login successfully", accessToken });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error!" });
    }
  },
  logout: async (_, res) => {
    try {
      res.clearCookie("refreshToken");
      return res.status(200).json({ message: "Logged out" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error!" });
    }
  },
  refreshToken: (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken)
        return res.status(401).json({ message: "Please login or register!" });

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err)
            return res
              .status(403)
              .json({ message: "Please login or register" });
          const accessToken = jwt.sign(
            { id: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );

          res.json({
            message: "Refresh complete",
            accessToken,
          });
        }
      );
    } catch (error) {
      return res.json(500).json({ message: "Internal server error!" });
    }
  },
};

module.exports = authCtrl;

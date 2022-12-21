const express = require("express");
const router = express.Router();
const authCtrl = require("../controller/authCtrl");

router
  .post("/register", authCtrl.register)
  .post("/login", authCtrl.login)
  .post("/refreshToken", authCtrl.refreshToken)
  .post("/logout", authCtrl.logout);

module.exports = router;

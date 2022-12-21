const router = require("express").Router();
const userCtrl = require("../controller/userCtrl");
const auth = require("../middleware/auth");
router
  .get("/user", auth, userCtrl.getInfo)
  .patch("/user", auth, userCtrl.updateUser)
  .get("/search", auth, userCtrl.searchUser);

module.exports = router;

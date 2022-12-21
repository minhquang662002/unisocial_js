const express = require("express");
const router = express.Router();
const friendCtrl = require("../controller/friendCtrl");
const auth = require("../middleware/auth");
router
  .get("/friend", auth, friendCtrl.getRequests)
  .get("/friend/suggestion", auth, friendCtrl.getSuggestions)
  .get("/friend/:user", auth, friendCtrl.existRequest)
  .post("/friend", auth, friendCtrl.sendRequest)
  .patch("/friend/accept/:requestID", auth, friendCtrl.acceptRequest)
  .patch("/friend/unfriend/:userID", auth, friendCtrl.unfriend)
  .delete("/friend/:requestID", auth, friendCtrl.cancelRequest);

module.exports = router;

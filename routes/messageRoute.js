const router = require("express").Router();
const auth = require("../middleware/auth");
const messageCtrl = require("../controller/messageCtrl");

router
  .get("/messages/single/:userID", auth, messageCtrl.getSingleMessages)
  .get("/messages/group/:groupID", auth, messageCtrl.getGroupMessages)
  .get("/conversations/group", auth, messageCtrl.getGroupConversations)
  .get("/conversations", auth, messageCtrl.getConversations)
  .post("/conversations/group", auth, messageCtrl.createGroupChat)
  .post("/messages", auth, messageCtrl.sendMessage)
  .patch("/conversations/group/:groupID", auth, messageCtrl.addMember)
  .patch("/conversations/group/:groupID/leave", auth, messageCtrl.leaveGroup)
  .patch(
    "/conversations/group/:groupID/kick",
    auth,
    messageCtrl.removeGroupChatMember
  )
  .delete("/conversations/group/:groupID", auth, messageCtrl.deleteGroupChat);

module.exports = router;

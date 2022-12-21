const router = require("express").Router();
const commentCtrl = require("../controller/commentCtrl");
const auth = require("../middleware/auth");

router
  .get("/comment", auth, commentCtrl.getComments)
  .get("/comment/:commentID", auth, commentCtrl.getReplies)
  .post("/comment/:postID", auth, commentCtrl.createComment)
  .patch("/comment/:commentID/like", auth, commentCtrl.likeComment)
  .patch("/comment/:commentID/unlike", auth, commentCtrl.unlikeComment)
  .patch("/comment", auth, commentCtrl.editComment)
  .delete("/comment/:commentID", auth, commentCtrl.deleteComment);

module.exports = router;

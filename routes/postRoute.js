const router = require("express").Router();
const postCtrl = require("../controller/postCtrl");
const auth = require("../middleware/auth");

router
  .post("/posts", auth, postCtrl.createPost)
  .get("/user_posts", auth, postCtrl.getUserPost)
  .get("/posts", auth, postCtrl.getPublicPost)
  .get("/post/:postID", auth, postCtrl.getSpecificPost)
  .get("/posts/save", auth, postCtrl.getSavedPosts)
  .patch("/posts/:id", auth, postCtrl.updatePost)
  .patch("/posts/:id/like", auth, postCtrl.likePost)
  .patch("/posts/:id/unlike", auth, postCtrl.unlikePost)
  .patch("/posts/save/:postID", auth, postCtrl.savePost)
  .patch("/posts/unsave/:postID", auth, postCtrl.unsavePost)
  .delete("/posts/:id", auth, postCtrl.deletePost);

module.exports = router;

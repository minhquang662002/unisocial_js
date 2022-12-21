const router = require("express").Router();
const newsCtrl = require("../controller/newsCtrl");
router.get("/news/hot", newsCtrl.getHotNews);
module.exports = router;

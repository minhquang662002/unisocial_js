const express = require("express");
const router = express.Router();
const notificationCtrl = require("../controller/notificationCtrl");
const auth = require("../middleware/auth");

router
  .get("/notification", auth, notificationCtrl.getNotifications)
  .get("/notification/unread", auth, notificationCtrl.getUnread)
  .post("/notification", auth, notificationCtrl.createNotification)
  .patch("/notification", auth, notificationCtrl.readAllNotifications)
  .patch("/notification/:ntfID", auth, notificationCtrl.readNotification)
  .patch(
    "/notifications/delete",
    auth,
    notificationCtrl.deleteAllNotifications
  );

module.exports = router;

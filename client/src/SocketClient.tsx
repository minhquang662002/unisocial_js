import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addRequest } from "./redux/slices/friendRequestSlice";
import { receiveNotification } from "./redux/slices/notificationSlice";
import { addOnline, removeOnline } from "./redux/slices/onlineSlice";
import { addPost, updatePost } from "./redux/slices/postSlice";
import { updateInfo } from "./redux/slices/authSlice";

const SocketClient = () => {
  const { auth, socket, online } = useSelector((state) => state);
  const dispatch = useDispatch();
  const spawnNotification = (body, icon, url, title) => {
    let options = {
      body,
      icon,
    };
    let n = new Notification(title, options);
    n.onclick = (e) => {
      e.preventDefault();
      window.open(url, "_blank");
    };
  };
  useEffect(() => {
    socket?.socket?.emit("logged", auth.user);
  }, [socket.socket, auth.user]);

  useEffect(() => {
    socket.socket.emit("active", auth.user);
  }, [socket.socket, auth.user]);

  useEffect(() => {
    socket?.socket?.on("checkActivesToClient", (actives) => {
      actives.forEach((item) => {
        let isExist = online?.online?.includes(item);
        if (!isExist) {
          dispatch(addOnline(item));
        }
      });
    });
    return () => socket.socket.off("checkActivesToClient");
  }, [socket.socket, online?.online, dispatch]);

  useEffect(() => {
    socket.socket.on("offlineToClient", (ofl) => {
      dispatch(removeOnline(ofl));
    });
    return () => socket.socket.off("offlineToClient");
  }, [socket.socket, dispatch]);

  useEffect(() => {
    socket.socket.on("createPostToClient", (newPost) => {
      dispatch(addPost(newPost));
    });
    return () => socket.socket.off("createPostToClient");
  }, [socket.socket, dispatch]);

  useEffect(() => {
    socket.socket.on("likePostToClient", (updateData) => {
      dispatch(updatePost(updateData));
    });
    return () => socket.socket.off("likePostToClient");
  }, [socket.socket, dispatch]);

  useEffect(() => {
    socket.socket.on("unlikePostToClient", (updateData) => {
      dispatch(updatePost(updateData));
    });
    return () => socket.socket.off("unlikePostToClient");
  }, [socket.socket, dispatch]);

  useEffect(() => {
    socket.socket.on("sendRequestToClient", (request) => {
      dispatch(addRequest([request]));
    });
    return () => socket.socket.off("sendRequestToClient");
  }, [socket.socket, dispatch]);

  useEffect(() => {
    socket.socket.on("acceptRequestToClient", (sender) => {
      dispatch(updateInfo({ friends: [...auth.user.friends, sender] }));
    });
    return () => socket.socket.off("acceptRequestToClient");
  }, [socket.socket, auth, dispatch]);

  useEffect(() => {
    socket.socket.on("createNotificationToClient", (ntf) => {
      dispatch(receiveNotification(ntf));
      spawnNotification(
        `${ntf.user.firstName} ${ntf.user.lastName} ${ntf.text}`,
        ntf.user.avatar,
        ntf.url,
        "UniSocial"
      );
    });
    return () => socket.socket.off("createNotificationToClient");
  }, [socket.socket, dispatch]);

  useEffect(() => {
    socket.socket.on("sendMessageToClient", (newMessage) => {
      spawnNotification(
        `${newMessage.sender.firstName} ${newMessage.sender.lastName}: ${newMessage?.text}`,
        newMessage.sender.avatar,
        "/",
        "UniSocial"
      );
    });
  }, [socket.socket]);

  // useEffect(() => {
  //   socket.socket.on("unlikeCommentToClient", (updatedPost) => {
  //     dispatch(updatePosts({ _id: updatedPost._id, post: updatedPost }));
  //   });
  //   return () => socket.socket.off("unlikePostToClient");
  // }, [socket.socket, dispatch]);

  return <></>;
};

export default SocketClient;

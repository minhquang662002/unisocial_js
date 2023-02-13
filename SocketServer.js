let users = [];
const SocketServer = (socket) => {
  socket.on("logged", (user) => {
    if (users.find((item) => item._id === user._id)) return;
    users.push({ _id: user._id, socketID: socket.id, friends: user.friends });
  });
  socket.on("disconnect", () => {
    const offline = users.find((user) => user.socketID === socket.id);
    if (offline) {
      const clients = users.filter((user) =>
        offline.friends.find((item) => user._id === item._id)
      );
      if (clients.length > 0) {
        clients.forEach((item) => {
          socket.to(`${item.socketID}`).emit("offlineToClient", offline._id);
        });
      }
    }
    users = users.filter((item) => item.socketID !== socket.id);
  });

  socket.on("active", (user) => {
    const onlines = users.filter((item) =>
      user.friends.find((friend) => item._id === friend._id)
    );
    const ids = onlines.map((item) => item._id);
    socket.emit("checkActivesToClient", ids);
    if (onlines.length > 0) {
      onlines.forEach((item) => {
        socket.to(`${item.socketID}`).emit("checkActivesToClient", [user?._id]);
      });
    }
  });

  socket.on("createPost", (newPost) => {
    const clients = users.filter((user) =>
      newPost.owner.friends.includes(user._id)
    );

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("createPostToClient", newPost);
      });
    }
  });

  socket.on("likePost", (updateData) => {
    const rel = [updateData.owner._id, ...updateData.owner.friends];
    const clients = users.filter((user) => rel.includes(user._id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("likePostToClient", updateData);
      });
    }
  });
  socket.on("unlikePost", (updateData) => {
    const rel = [updateData.owner._id, ...updateData.owner.friends];
    const clients = users.filter((user) => rel.includes(user._id));
    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("unlikePostToClient", updateData);
      });
    }
  });
  socket.on("createComment", (newComment) => {
    const rel = [...newComment.post.owner.friends, newComment.post.owner._id];
    const clients = users.filter((user) => rel.includes(user._id));
    if (clients.length > 0) {
      clients.forEach((client) => {
        socket
          .to(`${client.socketID}`)
          .emit("createCommentToClient", newComment);
      });
    }
  });
  // socket.on("likeComment", (updatePost) => {
  //   const rel = [...updatePost.user.friends, updatePost.user._id];
  //   const clients = users.filter((user) => rel.includes(user.id));
  //   if (clients.length > 0) {
  //     clients.forEach((client) => {
  //       socket.to(`${client.socketID}`).emit("likeCommentToClient", updatePost);
  //     });
  //   }
  // });
  // socket.on("unlikeComment", (updatePost) => {
  //   const rel = [...updatePost.user.friends, updatePost.user._id];
  //   const clients = users.filter((user) => rel.includes(user.id));
  //   if (clients.length > 0) {
  //     clients.forEach((client) => {
  //       socket
  //         .to(`${client.socketID}`)
  //         .emit("unlikeCommentToClient", updatePost);
  //     });
  //   }
  // });
  socket.on("sendMessage", (newMessage) => {
    const clients = users.filter((user) =>
      newMessage.conversation.receiver.includes(user?._id)
    );
    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("sendMessageToClient", newMessage);
      });
    }
  });

  socket.on("callUser", (call) => {
    console.log("having it");
    const clients = users.filter((user) => user._id === call.userToCall);
    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("callUserToClient", {
          signal: call.signalData,
          from: call.from,
          type: call.type,
        });
      });
    }
  });

  socket.on("answerCall", (data) => {
    const clients = users.filter((user) => user._id === data.to);
    if (clients.length > 0)
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("callAccepted", data.signal);
      });
  });

  socket.on("hideCam", () => {
    socket.emit("hideCamToClient", "ok");
  });

  socket.on("hideMic", () => {
    socket.emit("hideMicToClient", "ok");
  });

  socket.on("leaveCall", (id) => {
    const clients = users.filter((user) => user._id === id);
    if (clients.length > 0)
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("leaveCallToClient");
      });
  });

  socket.on("sendRequest", (request) => {
    const receiver = users.filter((user) => user._id === request.receiver);
    if (receiver.length > 0) {
      socket.to(`${receiver[0].socketID}`).emit("sendRequestToClient", request);
    }
  });

  socket.on("acceptRequest", ({ sender, user }) => {
    const receiver = users.filter((user) => user._id === sender._id);
    if (receiver.length > 0) {
      socket.to(`${receiver[0].socketID}`).emit("acceptRequestToClient", user);
    }
  });

  socket.on("createNotification", (ntf) => {
    const clients = users.filter((user) => ntf.receiver.includes(user._id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketID}`).emit("createNotificationToClient", ntf);
      });
    }
  });

  // socket.on("callVideoUser", ({ userToCall, signalData, from }) => {
  //   const target = users.filter((user) => user.id === userToCall);
  //   if (target.length > 0) {
  //     socket
  //       .to(target[0].socketID)
  //       .emit("callVideoUser", { signal: signalData, from });
  //   }
  // });
  // socket.on("answerCall", ({ signal, to }) => {
  //   const target = users.filter((user) => user.id === to);

  //   if (target.length > 0) {
  //     socket.to(target[0].socketID).emit("callAccepted", signal);
  //   }
  // });
  // socket.on("endCall", (id) => {
  //   const target = users.filter((user) => user.id === id);

  //   if (target.length > 0) {
  //     socket.to(target[0].socketID).emit("endCallToClient");
  //   }
  // });
  // socket.on("declineCall", (id) => {
  //   const target = users.filter((user) => user.id === id);

  //   if (target.length > 0) {
  //     socket.to(target[0].socketID).emit("declineCallToClient");
  //   }
  // });
};

module.exports = SocketServer;

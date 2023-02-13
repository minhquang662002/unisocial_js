import { useState, useEffect, useRef, createContext } from "react";
import SimplePeer from "simple-peer";
import { useSelector } from "react-redux";
const PeerContext = createContext();

const PeerContextProvider = ({ children }) => {
  const {
    socket,
    auth: { user },
  } = useSelector((state) => state);

  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callTarget, setCallTarget] = useState();
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState(null);
  const [type, setType] = useState("");
  const camToggle = useRef(true);
  const micToggle = useRef(true);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  useEffect(() => {
    socket?.socket?.on("callUserToClient", ({ from, signal, type }) => {
      setCallEnded(false);
      setCall({ isReceivingCall: true, from, signal });
      setType(type);
    });
  }, [socket]);

  const resetState = () => {
    setCallEnded(true);
    setCall(null);
    setCallAccepted(false);
    setStream(null);
    setType("");
  };

  const callUser = (id, type) => {
    setCallEnded(false);
    navigator.mediaDevices
      .getUserMedia({ video: type == "video", audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        setType(type);
        const callerPeer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: currentStream,
        });
        callerPeer.on("signal", (data) => {
          socket?.socket?.emit("callUser", {
            userToCall: id,
            signalData: data,
            type,
            from: {
              _id: user?._id,
              avatar: user?.avatar,
              lastName: user?.lastName,
              firstName: user?.firstName,
            },
          });
        });

        callerPeer.on("stream", (currentStream) => {
          if (userVideo.current) {
            userVideo.current.srcObject = currentStream;
          }
        });

        socket?.socket?.on("hideCamToClient", () => {
          const videoTrack = currentStream
            .getTracks()
            .find((track) => track.kind === "video");

          if (videoTrack) {
            if (camToggle.current) {
              videoTrack.enabled = false;
              camToggle.current = false;
            } else {
              videoTrack.enabled = true;
              camToggle.current = true;
            }
          }
        });

        socket?.socket?.on("hideMicToClient", () => {
          const videoTrack = currentStream
            .getTracks()
            .find((track) => track.kind === "audio");
          if (videoTrack) {
            if (camToggle.current) {
              videoTrack.enabled = false;
              micToggle.current = false;
            } else {
              videoTrack.enabled = true;
              micToggle.current = true;
            }
          }
        });

        socket?.socket?.on("leaveCallToClient", () => {
          if (connectionRef.current) {
            connectionRef.current.destroy();
          }
          socket?.socket?.off("callUser");
          socket?.socket?.off("callAccepted");

          currentStream.getTracks().forEach((track) => track.stop());

          resetState();
        });
        socket?.socket?.on("callAccepted", (signal) => {
          setCallAccepted(true);

          setTimeout(() => {
            if (type !== "audio" && myVideo.current) {
              myVideo.current.srcObject = currentStream;
            }
          }, 1000);
          callerPeer.signal(signal);
        });

        connectionRef.current = callerPeer;
      });
  };

  const answerCall = () => {
    setCallAccepted(true);
    setCallEnded(false);
    navigator.mediaDevices
      .getUserMedia({ video: type == "video", audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (type == "video") {
          if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
          }
        }

        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream: currentStream,
        });
        peer.on("signal", (data) => {
          socket?.socket?.emit("answerCall", {
            signal: data,
            to: call.from._id,
          });
        });

        peer.on("stream", (currentStream) => {
          if (userVideo.current) {
            userVideo.current.srcObject = currentStream;
          }
        });

        socket?.socket?.on("hideCamToClient", () => {
          const videoTrack = currentStream
            .getTracks()
            .find((track) => track.kind === "video");
          if (videoTrack) {
            if (camToggle.current) {
              videoTrack.enabled = false;
              camToggle.current = false;
            } else {
              videoTrack.enabled = true;
              camToggle.current = true;
            }
          }
        });

        socket?.socket?.on("hideMicToClient", () => {
          const videoTrack = currentStream
            .getTracks()
            .find((track) => track.kind === "audio");
          if (videoTrack) {
            if (micToggle.current) {
              videoTrack.enabled = false;
              micToggle.current = false;
            } else {
              videoTrack.enabled = true;
              micToggle.current = true;
            }
          }
        });

        socket?.socket?.on("leaveCallToClient", () => {
          if (connectionRef.current) {
            connectionRef.current.destroy();
          }
          socket?.socket?.off("callUser");
          socket?.socket?.off("callAccepted");
          resetState();
          currentStream.getTracks().forEach((track) => track.stop());
        });

        peer.signal(call.signal);

        if (connectionRef.current) {
          connectionRef.current = peer;
        }
      });
  };

  const leaveCall = (id) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    socket?.socket?.emit("leaveCall", id);
    socket?.socket?.off("callUser");
    socket?.socket?.off("callAccepted");

    resetState();
  };

  return (
    <PeerContext.Provider
      value={{
        callAccepted,
        callEnded,
        call,
        stream,
        myVideo,
        userVideo,
        callTarget,
        camToggle,
        micToggle,
        type,
        setCallTarget,
        callUser,
        answerCall,
        leaveCall,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export { PeerContextProvider, PeerContext };

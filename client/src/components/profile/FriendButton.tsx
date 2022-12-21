import { FaUserFriends, FaUserPlus } from "react-icons/fa";
import {
  useSendRequestMutation,
  useCheckExistRequestQuery,
  useCancelRequestMutation,
  useAcceptRequestMutation,
  useUnfriendMutation,
} from "../../redux/services/friendRequest.service";
import { useCreateNotificationMutation } from "../../redux/services/notification.service";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppSelector } from "../../hooks/hooks";
const FriendButton = () => {
  const {
    socket: { socket },
    auth,
    user: { user },
  } = useAppSelector((state) => state);
  let friendButton;

  const [sendRequest] = useSendRequestMutation();
  const [cancelRequest] = useCancelRequestMutation();
  const [acceptRequest] = useAcceptRequestMutation();
  const [unfriend] = useUnfriendMutation();
  const [createNotification] = useCreateNotificationMutation();
  const [searchKey] = useSearchParams();
  const [showReponse, setShowResponse] = useState(false);
  const [existedReq, setExistedReq] = useState(null);
  const { data } = useCheckExistRequestQuery(user?._id, {
    skip: !user?._id || user?._id === auth?.user?._id,
  });

  useEffect(() => {
    if (data) {
      setExistedReq(data);
    }
  }, [data]);

  useEffect(() => {
    socket?.on("sendRequestToClient", (request) => {
      setExistedReq(request);
    });
    return () => {
      socket?.off("sendRequestToClient");
    };
  }, [socket]);
  if (auth?.user?.friends.some((item) => item._id === searchKey.get("id"))) {
    friendButton = (
      <div
        className="relative bg-cyan-400 text-white"
        onClick={() => setShowResponse((state) => !state)}
      >
        <FaUserFriends />
        <span>Friend</span>
        {showReponse && (
          <div
            className="absolute top-12 border border-gray-200 bg-white rounded-lg shadow text-black p-2 text-sm"
            onClick={() => {
              unfriend(searchKey.get("id"));
              setExistedReq(null);
            }}
          >
            <p>Unfriend</p>
          </div>
        )}
      </div>
    );
  } else {
    if (existedReq) {
      if (existedReq?.sender?._id === auth?.user?._id) {
        friendButton = (
          <div
            className="flex items-center bg-cyan-400 text-white hover:bg-cyan-500"
            onClick={() => {
              cancelRequest(existedReq._id);
              setExistedReq(null);
            }}
          >
            Cancel request
          </div>
        );
      } else if (existedReq?.receiver === auth?.user?._id) {
        friendButton = (
          <div
            className="flex items-center bg-cyan-400 text-white hover:bg-cyan-500 relative"
            onClick={() => setShowResponse((state) => !state)}
          >
            Response
            {showReponse && (
              <div className="absolute w-48 top-12 border border-gray-200 bg-white rounded-lg shadow text-black font-bold whitespace-nowrap p-2 text-sm">
                <p
                  className="rounded p-1 hover:bg-cyan-400 hover:text-white transition-colors cursor-pointer"
                  onClick={async () => {
                    const { data } = await acceptRequest({
                      requestID: existedReq._id,
                      sender: existedReq.sender,
                    });

                    if (data) {
                      createNotification({
                        receiver: [existedReq.sender._id],
                        text: "accepted your friend request",
                        url: "/friends",
                      });
                    }
                    setExistedReq(null);
                  }}
                >
                  Confirm
                </p>
                <p
                  className="rounded p-1 hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                  onClick={() => {
                    cancelRequest(existedReq._id);
                    setExistedReq(null);
                  }}
                >
                  Delete request
                </p>
              </div>
            )}
          </div>
        );
      }
    } else {
      friendButton = (
        <div
          className="flex items-center bg-cyan-400 text-white hover:bg-cyan-500"
          onClick={async () => {
            const { data } = await sendRequest(searchKey.get("id"));
            if (data) {
              createNotification({
                receiver: [searchKey.get("id")],
                text: "send you a friend request",
                url: "/friends",
              });
              setExistedReq(data[0]);
            }
          }}
        >
          <FaUserPlus />
          Add friend
        </div>
      );
    }
  }
  return <>{friendButton}</>;
};

export default FriendButton;

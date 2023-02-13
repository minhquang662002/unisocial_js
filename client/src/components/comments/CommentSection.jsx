import Comment from "./Comment";
import { useState, useEffect } from "react";
import { useGetCommentsQuery } from "../../redux/services/comment.service";
import CommentInput from "./CommentInput";

const CommentSection = ({ user, socket, post }) => {
  const [page, setPage] = useState(0);
  const [commentList, setCommentList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { data = [] } = useGetCommentsQuery(
    { id: post?._id, page },
    { skip: !!hasMore }
  );
  useEffect(() => {
    if (data.length) {
      setCommentList((state) => [...state, ...data]);
    } else {
      setHasMore(false);
    }
  }, [data]);

  useEffect(() => {
    socket.socket.on("createCommentToClient", (newComment) => {
      if (newComment.post._id === post?._id) {
        if (!newComment.reply) {
          setCommentList((state) => [newComment, ...state]);
        }
      }
    });
  }, [socket, post]);

  return (
    <>
      <div className="border-b border-gray-300 dark:border-purple-500" />
      <div className="flex flex-col gap-2 p-4 relative">
        <CommentInput user={user} setCommentList={setCommentList} post={post} />

        {commentList?.map((item, index) => (
          <Comment
            key={item?._id}
            pos={index}
            item={item}
            user={user}
            setCommentList={setCommentList}
            commentList={commentList}
            post={post}
            socket={socket}
          />
        ))}
        {hasMore && (
          <p
            className="cursor-pointer inline-block"
            onClick={() => setPage((state) => state + 1)}
          >
            View more comments
          </p>
        )}
      </div>
    </>
  );
};

export default CommentSection;

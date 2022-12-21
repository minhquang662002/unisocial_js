import { useState, FC } from "react";
import { useAppSelector } from "../../hooks/hooks";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import CommentSection from "../comments/CommentSection";
import { Post as IPost } from "../../utils/types";

interface Props {
  item: IPost;
  type?: string;
}

const Post: FC<Props> = ({ item, type }) => {
  const [showComments, setShowComments] = useState(false);

  const {
    auth: { user },
    socket,
  } = useAppSelector((state) => state);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-purple-500 shadow-lg text-sm mb-6">
      <PostHeader item={item} user={user} type={type} />
      <div className="border-b border-gray-300 dark:border-purple-500 mb-1" />
      <PostBody item={item} setShowComments={setShowComments} />
      <div className="border-b border-gray-300 dark:border-purple-500" />
      <PostFooter
        item={item}
        user={user}
        showComments={showComments}
        setShowComments={setShowComments}
      />
      {showComments && (
        <CommentSection user={user} post={item} socket={socket} />
      )}
    </div>
  );
};

export default Post;

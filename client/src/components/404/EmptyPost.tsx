import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../../asset/emptypost.json";
import { useRef } from "react";

const EmptyPost = () => {
  const playerRef = useRef();
  return (
    <div className="flex flex-col">
      <Player
        ref={playerRef}
        autoplay={true}
        loop={true}
        src={animationData}
        style={{ width: "200px" }}
      />
      <p className="text-xs text-gray-300 text-center mt-4">
        No post available
      </p>
    </div>
  );
};

export default EmptyPost;

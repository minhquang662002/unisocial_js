import HomeLeft from "./HomeLeft";
import HomeCenter from "./HomeCenter";
import HomeRight from "./HomeRight";
import { Helmet } from "react-helmet-async";
import { useAppSelector, useAppDispatch } from "../../hooks/hooks";
import { useEffect } from "react";
import { resetPostState } from "../../redux/slices/postSlice";

const HomePage = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  useEffect(() => {
    return () => {
      dispatch(resetPostState());
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>UniSocial</title>
      </Helmet>
      <div className="flex px-8 justify-between gap-14">
        <div className="hidden md:flex flex-col sticky top-16 basis-2/6 py-8 h-[calc(100vh-4rem)] overflow-x-hidden dark:text-white">
          <HomeLeft user={user} />
        </div>

        <HomeCenter user={user} token={token} />

        <div className="hidden md:flex flex-col sticky top-16 basis-2/6 py-8 h-[calc(100vh-4rem)] text-sm dark:text-white">
          <HomeRight user={user} />
        </div>
      </div>
    </>
  );
};

export default HomePage;

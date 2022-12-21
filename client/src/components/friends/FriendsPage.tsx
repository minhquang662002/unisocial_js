import { Helmet } from "react-helmet-async";
import FriendCard from "./FriendCard";
import SuggestionSection from "./SuggestionSection";
import { useAppSelector } from "../../hooks/hooks";

const FriendsPage = () => {
  const {
    friendRequest: { requests },
  } = useAppSelector((state) => state);

  return (
    <>
      <Helmet>
        <title>Friends | UniSocial</title>
      </Helmet>
      <div className="flex-grow p-4 dark:text-white">
        <p className="font-bold text-xl">Friend requests</p>
        <div className="flex flex-col md:grid grid-cols-4 gap-2 mt-2">
          {requests?.map((item: any) => (
            <FriendCard key={item?._id} item={item} />
          ))}
        </div>
        <p className="font-bold text-xl">Suggestions</p>
        <SuggestionSection />
      </div>
    </>
  );
};

export default FriendsPage;

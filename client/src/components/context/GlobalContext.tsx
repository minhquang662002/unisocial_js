import { FC, useState, createContext } from "react";

interface Context {
  showModal: {
    post: boolean;
    profile: boolean;
    create_group: boolean;
    group_settings: boolean;
    confirm_modal: boolean;
  };
  postChoices: {
    tags: boolean;
    images: boolean;
  };
  showChatBox: any[];
  userLocation: any;
  loading: boolean;
  setShowModal: React.Dispatch<
    React.SetStateAction<{
      post: any;
      profile: boolean;
      create_group: boolean;
      group_settings: boolean;
      confirm_modal: boolean;
    }>
  >;
  setPostChoices: React.Dispatch<
    React.SetStateAction<{
      tags: boolean;
      images: boolean;
    }>
  >;
  setShowChatBox: React.Dispatch<React.SetStateAction<never[]>>;
  setUserLocation: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialContext = {
  showModal: {
    post: false,
    profile: false,
    create_group: false,
    group_settings: false,
    confirm_modal: false,
  },
  postChoices: {
    tags: false,
    images: false,
  },
  showChatBox: [],
  userLocation: null,
  loading: false,
  setShowModal: () => {},
  setPostChoices: () => {},
  setShowChatBox: () => {},
  setUserLocation: () => {},
  setLoading: () => {},
};

const GlobalContext = createContext<Context>(initialContext);

const GlobalContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showModal, setShowModal] = useState({
    post: false,
    profile: false,
    create_group: false,
    group_settings: false,
    confirm_modal: false,
  });
  const [postChoices, setPostChoices] = useState({
    tags: false,
    images: false,
  });
  const [showChatBox, setShowChatBox] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <GlobalContext.Provider
      value={{
        showModal,
        setShowModal,
        postChoices,
        setPostChoices,
        showChatBox,
        setShowChatBox,
        userLocation,
        setUserLocation,
        loading,
        setLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContextProvider, GlobalContext };

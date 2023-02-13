import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../utils/constants";
import { toast } from "react-toastify";
import { updateInfo } from "../slices/authSlice";
import { removeRequest } from "../slices/friendRequestSlice";

export const friendRequestApi = createApi({
  reducerPath: "friendRequestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}/api`,
    prepareHeaders: (headers, { getState }) => {
      const { token } = getState().auth;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getRequests: builder.query({
      query: () => "/friend",
    }),
    checkExistRequest: builder.query({
      query: (user) => `/friend/${user}`,
    }),
    getSuggestions: builder.query({
      query: (page) => `/friend/suggestion?page=${page}`,
    }),
    sendRequest: builder.mutation({
      query: (receiver) => {
        return {
          url: "/friend",
          method: "post",
          body: {
            receiver,
          },
        };
      },
      async onQueryStarted(_, { queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const { socket } = getState().socket;
          socket?.emit("sendRequest", data[0]);
        } catch (error) {
          toast.error("Error");
        }
      },
    }),
    acceptRequest: builder.mutation({
      query: ({ requestID, sender }) => {
        return {
          url: `/friend/accept/${requestID}`,
          method: "PATCH",
          body: {
            sender: sender,
          },
        };
      },
      async onQueryStarted(
        { requestID, sender },
        { dispatch, getState, queryFulfilled }
      ) {
        try {
          await queryFulfilled;
          const {
            auth: { user },
            socket: { socket },
          } = getState();

          dispatch(updateInfo({ friends: [...[user?.friends], sender] }));
          dispatch(removeRequest(requestID));
          socket?.emit("acceptRequest", { sender, user });
        } catch (error) {
          toast.error("Error");
        }
      },
    }),
    cancelRequest: builder.mutation({
      query: (requestID) => {
        return {
          url: `/friend/${requestID}`,
          method: "delete",
        };
      },
      onQueryStarted(requestID, { dispatch }) {
        dispatch(removeRequest(requestID));
      },
    }),
    unfriend: builder.mutation({
      query: (userID) => {
        return {
          url: `/friend/unfriend/${userID}`,
          method: "PATCH",
        };
      },
      onQueryStarted(userID, { dispatch, getState }) {
        const { user } = getState().auth;
        dispatch(
          updateInfo({
            ...user,
            friends: user?.friends.filter((item) => item?._id !== userID),
          })
        );
      },
    }),
  }),
});

export const {
  useGetRequestsQuery,
  useCheckExistRequestQuery,
  useGetSuggestionsQuery,
  useSendRequestMutation,
  useAcceptRequestMutation,
  useCancelRequestMutation,
  useUnfriendMutation,
} = friendRequestApi;

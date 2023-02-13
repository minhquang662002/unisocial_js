import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../utils/constants";
import { addGroup } from "../slices/messageSlice";

export const messageApi = createApi({
  reducerPath: "messageApi",
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
    getSingleMessages: builder.query({
      query: ({ id, page }) => `/messages/single/${id}?page=${page}`,
    }),
    getGroupMessages: builder.query({
      query: ({ id, page }) => `/messages/group/${id}?page=${page}`,
    }),
    getAllConversations: builder.query({
      query: () => "/conversations",
    }),
    getGroupConversations: builder.query({
      query: () => "/conversations/group",
    }),
    createGroupChat: builder.mutation({
      query: (data) => {
        return {
          url: `/conversations/group`,
          method: "post",
          body: data,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(addGroup(data));
      },
    }),
    sendMessage: builder.mutation({
      query: ({ data, receiver, conveID, sender, type }) => {
        return {
          url: "/messages",
          method: "post",
          body: {
            receiver,
            ...data,
            conveID,
            sender,
            type,
          },
        };
      },
      async onQueryStarted(_, { getState, queryFulfilled }) {
        const { socket } = getState().socket;
        const { data: newMessage } = await queryFulfilled;
        socket?.emit("sendMessage", newMessage);
      },
    }),
    addMember: builder.mutation({
      query: ({ member, groupID }) => {
        return {
          url: `/conversations/group/${groupID}`,
          method: "PATCH",
          body: {
            member,
          },
        };
      },
    }),
    leaveGroup: builder.mutation({
      query: (groupID) => {
        return {
          url: `/conversations/group/${groupID}/leave`,
          method: "PATCH",
        };
      },
    }),
    removeGroupChatMember: builder.mutation({
      query: ({ groupID, memberID, adminID }) => {
        return {
          url: `/conversations/group/${groupID}/kick?memberID=${memberID}`,
          method: "PATCH",
          body: {
            adminID,
          },
        };
      },
    }),
    deleteGroupChat: builder.mutation({
      query: (groupID) => {
        return {
          url: `/conversations/group/${groupID}`,
          method: "DELETE",
        };
      },
    }),
  }),
});

export const {
  useGetSingleMessagesQuery,
  useGetGroupMessagesQuery,
  useGetAllConversationsQuery,
  useGetGroupConversationsQuery,
  useSendMessageMutation,
  useCreateGroupChatMutation,
  useLeaveGroupMutation,
  useAddMemberMutation,
  useDeleteGroupChatMutation,
  useRemoveGroupChatMemberMutation,
} = messageApi;

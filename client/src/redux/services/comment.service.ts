import { RootState } from "./../app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../utils/constants";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}/api`,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: ({ postID, commentID, data }) => {
        return {
          url: `/comment/${postID}${
            commentID ? `?commentID=${commentID}` : ""
          }`,
          method: "post",
          body: data,
        };
      },
      async onQueryStarted(_, { getState, queryFulfilled }) {
        const { socket } = (getState() as RootState).socket;
        const { data: newComment } = await queryFulfilled;
        socket?.emit("createComment", newComment);
      },
    }),
    getComments: builder.query({
      query: ({ id, page }) => `/comment?post=${id}&page=${page}`,
    }),
    getReplies: builder.query({
      query: ({ commentID, page }) => `/comment/${commentID}?page=${page}`,
    }),
    deleteComment: builder.mutation({
      query: ({ commentID, postID }) => {
        return {
          url: `/comment/${commentID}?postID=${postID}`,
          method: "delete",
        };
      },
    }),
    updateComment: builder.mutation({
      query: ({ data, commentID }) => {
        return {
          url: `/comment?id=${commentID}`,
          method: "PATCH",
          body: data,
        };
      },
    }),
    likeComment: builder.mutation({
      query: (id) => {
        return {
          url: `/comment/${id}/like`,
          method: "PATCH",
        };
      },
    }),
    unlikeComment: builder.mutation({
      query: (id) => {
        return {
          url: `/comment/${id}/unlike`,
          method: "PATCH",
        };
      },
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsQuery,
  useGetRepliesQuery,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} = commentApi;

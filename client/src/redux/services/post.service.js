import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../utils/constants";
import { removePost, updatePost } from "../slices/postSlice";
import { toast } from "react-toastify";

export const postApi = createApi({
  reducerPath: "postApi",
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
    getUserPosts: builder.query({
      query: ({ id, page }) => `/user_posts?id=${id}&page=${page}`,
    }),
    getPublicPosts: builder.query({
      query: (page) => `/posts?page=${page}`,
    }),
    createPost: builder.mutation({
      query: (data) => {
        return {
          url: "/posts",
          method: "post",
          body: data,
        };
      },
      async onQueryStarted(_, { queryFulfilled, getState }) {
        const { socket } = getState().socket;
        const { data: newPost } = await queryFulfilled;
        socket?.emit("createPost", newPost.post);
      },
    }),
    updatePost: builder.mutation({
      query: ({ data, id }) => ({
        url: `/posts/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        if (res.data) {
          dispatch(updatePost(arg));
        }
      },
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const res = await queryFulfilled;
        if (res.data) {
          dispatch(removePost(id));
        }
      },
    }),
    likePost: builder.mutation({
      query: ({ id }) => {
        return {
          url: `/posts/${id}/like`,
          method: "PATCH",
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        dispatch(updatePost(arg));
        const { socket } = getState().socket;
        await queryFulfilled;
        socket?.emit("likePost", arg);
      },
    }),
    unlikePost: builder.mutation({
      query: ({ id }) => {
        return {
          url: `/posts/${id}/unlike`,
          method: "PATCH",
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        dispatch(updatePost(arg));
        const { socket } = getState().socket;
        await queryFulfilled;
        socket?.emit("unlikePost", arg);
      },
    }),
    savePost: builder.mutation({
      query: (postID) => {
        return {
          url: `posts/save/${postID}`,
          method: "PATCH",
        };
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data);
        } catch (error) {
          toast.error("Error");
        }
      },
    }),
    unsavePost: builder.mutation({
      query: (postID) => {
        return {
          url: `posts/unsave/${postID}`,
          method: "PATCH",
        };
      },
      onQueryStarted(postID, { dispatch }) {
        dispatch(removePost(postID));
      },
    }),
    getSavedPost: builder.query({
      query: () => "posts/save",
    }),
  }),
});

export const {
  useGetPublicPostsQuery,
  useGetUserPostsQuery,
  useGetSavedPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
} = postApi;

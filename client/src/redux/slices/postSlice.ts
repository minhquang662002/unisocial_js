import { ResResult } from "./../../utils/types";
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { postApi } from "../services/post.service";
import { Post } from "../../utils/types";

interface InitState {
  posts: Post[];
  total: null;
}

const initialState: InitState = {
  posts: [],
  total: null,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((item) => item._id !== action.payload);
    },
    updatePost: (state, action) => {
      state.posts.forEach((item, index) => {
        if (item._id === action.payload.id) {
          return (state.posts[index] = { ...item, ...action.payload.data });
        }
      });
    },

    resetPostState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        postApi.endpoints.createPost.matchFulfilled,
        (state, action) => {
          state.posts.unshift(action.payload.post);
          toast.success(action.payload.message);
        }
      )
      .addMatcher(postApi.endpoints.getUserPosts.matchRejected, (_, action) => {
        toast.error((action.payload?.data as ResResult).message);
      })
      .addMatcher(
        postApi.endpoints.getUserPosts.matchFulfilled,
        (state, action) => {
          if (action.payload) {
            state.posts.push(...action.payload.result);
            state.total = action.payload.totalCount.count;
          }
        }
      )

      .addMatcher(
        postApi.endpoints.getPublicPosts.matchFulfilled,
        (state, action) => {
          if (action.payload) {
            state.posts.push(...action.payload.result);
            state.total = action.payload.totalCount.count;
          }
        }
      )
      .addMatcher(postApi.endpoints.updatePost.matchFulfilled, (_, action) => {
        toast.success(action.payload);
      })
      .addMatcher(
        postApi.endpoints.getSavedPost.matchFulfilled,
        (state, action) => {
          if (action.payload) {
            state.posts.push(...action.payload.posts);
            state.total = null;
          }
        }
      );
  },
});
export const { addPost, removePost, updatePost, resetPostState } =
  postSlice.actions;
export default postSlice.reducer;

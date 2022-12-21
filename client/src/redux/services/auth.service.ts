import { RootState } from "./../app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../utils/constants";

export const authApi = createApi({
  reducerPath: "authApi",
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
    loginUser: builder.mutation({
      query: ({ email, password }) => {
        return {
          url: "/login",
          method: "post",
          body: {
            email,
            password,
          },
        };
      },
    }),
    logoutUser: builder.mutation({
      query: () => {
        return {
          url: "/logout",
          method: "post",
        };
      },
    }),
    register: builder.mutation({
      query: ({
        firstName,
        lastName,
        email,
        password,
        confirm_password,
        gender,
        address,
        birthday,
      }) => {
        return {
          url: "/register",
          method: "post",
          body: {
            firstName,
            lastName,
            email,
            password,
            confirm_password,
            gender,
            address,
            birthday,
          },
        };
      },
    }),
    refreshToken: builder.mutation({
      query: () => {
        return {
          url: "/refreshToken",
          method: "post",
        };
      },
    }),
    getLoggedUser: builder.query({
      query: () => `/user`,
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutUserMutation,
  useGetLoggedUserQuery,
} = authApi;

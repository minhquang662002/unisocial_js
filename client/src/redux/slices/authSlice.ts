import { ResResult } from "./../../utils/types";
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { User } from "../../utils/types";
import { authApi } from "../services/auth.service";

interface InitState {
  user: null | User;
  token: null | string;
}

const initialState: InitState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      localStorage.setItem("isLogged", JSON.stringify(true));
      state.token = action.payload;
    },
    updateInfo: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.loginUser.matchFulfilled,
        (state, action) => {
          localStorage.setItem("isLogged", "true");
          state.token = action.payload.accessToken;
          toast.success(action.payload.message);
        }
      )
      .addMatcher(authApi.endpoints.loginUser.matchRejected, (_, action) => {
        console.log(action);
        toast.error((action.payload?.data as ResResult)?.message);
      })

      //register

      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, action) => {
          localStorage.setItem("isLogged", "true");
          state.token = action.payload.accessToken;
          toast.success(action.payload.message);
        }
      )
      .addMatcher(authApi.endpoints.register.matchRejected, (_, action) => {
        toast.error((action.payload?.data as ResResult)?.message);
      })

      //logout

      .addMatcher(authApi.endpoints.logoutUser.matchFulfilled, () => {
        localStorage.removeItem("isLogged");
      })

      //refresh

      .addMatcher(
        authApi.endpoints.refreshToken.matchFulfilled,
        (state, action) => {
          state.token = action.payload.accessToken;
        }
      )
      .addMatcher(authApi.endpoints.refreshToken.matchRejected, () => {
        localStorage.removeItem("isLogged");
      })
      .addMatcher(
        authApi.endpoints.getLoggedUser.matchFulfilled,
        (state, action) => {
          state.user = action.payload;
        }
      );
  },
});
export const { login, updateInfo } = authSlice.actions;
export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";

interface InitialState {
  socket: null | Socket
}

const initialState : InitialState = {
  socket: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    updateSocket: (state, action) => {
      state.socket = action.payload;
    },
  },
});
export const { updateSocket } = socketSlice.actions;
export default socketSlice.reducer;

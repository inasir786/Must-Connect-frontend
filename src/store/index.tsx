import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Auth Slice ───────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as { id: string; name: string; email: string } | null,
    token: null as string | null,
  },
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: typeof state.user; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
});

// ─── Store ────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export const { setCredentials, logout } = authSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
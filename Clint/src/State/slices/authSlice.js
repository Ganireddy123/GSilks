import { createSlice } from "@reduxjs/toolkit";
import { TOKEN_KEY } from "../../API";

const USER_KEY = "gsilks-user";

const loadUser = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: window.sessionStorage.getItem(TOKEN_KEY) || "",
    user: loadUser(),
    loading: false,
    error: null,
  },
  reducers: {
    setSession(state, action) {
      const { token, user } = action.payload;
      window.sessionStorage.setItem(TOKEN_KEY, token);
      window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      state.token = token;
      state.user = user;
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    logoutUser(state) {
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.removeItem(USER_KEY);
      state.token = "";
      state.user = null;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const { setSession, setUser, logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

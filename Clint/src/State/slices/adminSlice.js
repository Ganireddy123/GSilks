import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: { products: [], categories: [], orders: [], users: [], loading: false, error: null },
  reducers: {
    setAdminResource(state, action) { state[action.payload.resource] = action.payload.items; state.loading = false; state.error = null; },
    replaceAdminOrder(state, action) { state.orders = state.orders.map((order) => order.id === action.payload.id ? action.payload : order); },
    replaceAdminUser(state, action) { state.users = state.users.map((user) => user.id === action.payload.id ? action.payload : user); },
    setAdminLoading(state, action) { state.loading = action.payload; },
    setAdminError(state, action) { state.error = action.payload; state.loading = false; },
  },
});

export const { setAdminResource, replaceAdminOrder, replaceAdminUser, setAdminLoading, setAdminError } = adminSlice.actions;
export default adminSlice.reducer;
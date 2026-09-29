import { createSlice } from "@reduxjs/toolkit";

const ordersSlice = createSlice({
  name: "orders",
  initialState: { items: [], selected: null, loading: false, error: null },
  reducers: {
    setOrders(state, action) { state.items = action.payload; state.loading = false; state.error = null; },
    setSelectedOrder(state, action) { state.selected = action.payload; state.loading = false; state.error = null; },
    addOrder(state, action) { state.items = [action.payload, ...state.items]; state.selected = action.payload; },
    replaceOrder(state, action) { state.items = state.items.map((order) => order.id === action.payload.id ? action.payload : order); },
    setOrdersLoading(state, action) { state.loading = action.payload; },
    setOrdersError(state, action) { state.error = action.payload; state.loading = false; },
    clearOrdersError(state) { state.error = null; },
  },
});

export const { setOrders, setSelectedOrder, addOrder, replaceOrder, setOrdersLoading, setOrdersError, clearOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;

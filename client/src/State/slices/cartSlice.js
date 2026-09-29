import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], grandTotal: 0, itemCount: 0, loading: false, error: null },
  reducers: {
    setCart(state, action) {
      Object.assign(state, action.payload);
      state.loading = false;
      state.error = null;
    },
    setCartLoading(state, action) { state.loading = action.payload; },
    setCartError(state, action) { state.error = action.payload; state.loading = false; },
    resetCart: () => ({ items: [], grandTotal: 0, itemCount: 0, loading: false, error: null }),
  },
});

export const { setCart, setCartLoading, setCartError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;

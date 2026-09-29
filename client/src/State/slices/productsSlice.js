import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], categories: [], availableCategories: [], selected: null, pagination: null, loading: false, error: null },
  reducers: {
    setProducts(state, action) {
      state.items = action.payload.items || [];
      state.pagination = action.payload.pagination || null;
      const categoryMap = new Map();
      state.items.forEach((product) => {
        if (product.category_slug && !categoryMap.has(product.category_slug)) {
          categoryMap.set(product.category_slug, {
            id: product.category_id,
            slug: product.category_slug,
            name: product.category_name,
          });
        }
      });
      if (categoryMap.size) state.availableCategories = [...categoryMap.values()];
      state.loading = false;
      state.error = null;
    },
    setCategories(state, action) {
      state.categories = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedProduct(state, action) {
      state.selected = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProductsLoading(state, action) { state.loading = action.payload; },
    setProductsError(state, action) { state.error = action.payload; state.loading = false; },
  },
});

export const { setProducts, setCategories, setSelectedProduct, setProductsLoading, setProductsError } = productsSlice.actions;
export default productsSlice.reducer;

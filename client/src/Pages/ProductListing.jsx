import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import { ProductCard } from "../Components/Home/ProductCard";
import { setCategories, setProducts, setProductsError, setProductsLoading } from "../State/slices/productsSlice";
import AppAPI from "../API";

const fetchProducts = (dispatch, params = {}) => {
  dispatch(setProductsLoading(true));
  try {
    AppAPI.getProducts.get({ limit: 48, ...params })
      .then((result) => dispatch(setProducts(result.data)))
      .catch((error) => dispatch(setProductsError(error.message)));
  } catch (error) {
    dispatch(setProductsError(error.message));
  }
};

export default function ProductListing() {
  const dispatch = useDispatch();
  const { items, categories, loading, error } = useSelector((state) => state.products);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchProducts(dispatch);
    try {
      AppAPI.getCategories.get()
        .then((result) => dispatch(setCategories(result.data?.categories || [])))
        .catch((requestError) => dispatch(setProductsError(requestError.message)));
    } catch (requestError) {
      dispatch(setProductsError(requestError.message));
    }
  }, [dispatch]);

  const applyFilters = (event) => {
    event.preventDefault();
    fetchProducts(dispatch, { search: search.trim(), category: category || undefined });
  };

  const selectCategory = (value) => {
    setCategory(value);
    fetchProducts(dispatch, { search: search.trim(), category: value || undefined });
  };

  return (
    <>
      <Navbar />
      <Box sx={{ px: { xs: 3, md: 6 }, py: 6, bgcolor: "#F6F2EA", minHeight: "65vh" }}>
        <Typography component="h1" sx={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "#5C1620", fontSize: 38, mb: 3 }}>
          Silk Sarees
        </Typography>
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, mb: 2 }}>
          <Button onClick={() => selectCategory("")} variant={!category ? "contained" : "outlined"} aria-pressed={!category} sx={{ flexShrink: 0, bgcolor: !category ? "#5C1620" : "transparent", borderColor: "#5C1620", color: !category ? "#fff" : "#5C1620" }}>
            All sarees
          </Button>
          {categories.map((item) => (
            <Button key={item.id} onClick={() => selectCategory(item.slug)} variant={category === item.slug ? "contained" : "outlined"} aria-pressed={category === item.slug} sx={{ flexShrink: 0, bgcolor: category === item.slug ? "#5C1620" : "transparent", borderColor: "#5C1620", color: category === item.slug ? "#fff" : "#5C1620" }}>
              {item.name}
            </Button>
          ))}
        </Box>
        <Box component="form" onSubmit={applyFilters} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr auto", sm: "minmax(220px, 1fr) auto" }, gap: 1.5, mb: 4 }}>
          <TextField label="Search sarees" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Button type="submit" variant="contained" sx={{ bgcolor: "#5C1620", px: 3 }}>Search</Button>
        </Box>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && !items.length && <Typography>Loading products...</Typography>}
        {!loading && !items.length && <Typography>No products are available right now.</Typography>}
        <Grid container spacing={3}>
          {items.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Footer />
    </>
  );
}
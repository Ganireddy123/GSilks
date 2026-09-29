import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import { setCart } from "../State/slices/cartSlice";
import { setProductsError, setProductsLoading, setSelectedProduct } from "../State/slices/productsSlice";
import { resolveAssetUrl } from "../API";
import AppAPI from "../API";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: product, loading, error } = useSelector((state) => state.products);
  const isLoggedIn = useSelector((state) => Boolean(state.auth.token));

  useEffect(() => {
    dispatch(setProductsLoading(true));
    try {
      AppAPI.getProductById.get({ id })
        .then((result) => dispatch(setSelectedProduct(result.data?.product || null)))
        .catch((e) => dispatch(setProductsError(e.message)));
    } catch (err) {
      dispatch(setProductsError(err.message));
    }
  }, [dispatch, id]);

  const addToCart = () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      AppAPI.addToCart.post(undefined, { productId: product.id, quantity: 1 })
        .then((result) => dispatch(setCart(result.data?.cart)))
        .catch((e) => dispatch(setProductsError(e.message)));
    } catch (err) {
      dispatch(setProductsError(err.message));
    }
  };

  return <>
    <Navbar />
    <Box sx={{ px: { xs: 3, md: 8 }, py: 6, bgcolor: "#F6F2EA", minHeight: "65vh" }}>
      <Typography component={Link} to="/products" sx={{ color: "#7A1F2B", textDecoration: "none" }}>Back to sarees</Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {loading && !product ? <Typography sx={{ mt: 4 }}>Loading product...</Typography> : product && <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 5, mt: 3 }}>
        <Box component="img" src={resolveAssetUrl(product.image_url)} alt={product.name} sx={{ width: "100%", maxHeight: 620, objectFit: "cover", bgcolor: "white" }} />
        <Box>
          <Typography sx={{ color: "#B98A3D", textTransform: "uppercase", fontSize: 12, fontWeight: 700 }}>{product.category_name}</Typography>
          <Typography component="h1" sx={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "#5C1620", fontSize: 36, mt: 1 }}>{product.name}</Typography>
          <Typography sx={{ fontSize: 22, mt: 2 }}>₹{Number(product.price).toLocaleString("en-IN")}</Typography>
          <Typography sx={{ mt: 2, color: "text.secondary", lineHeight: 1.8 }}>{product.description}</Typography>
          <Typography sx={{ mt: 2 }}>Material: {product.material || "Silk"} · Color: {product.color || "—"}</Typography>
          <Button onClick={addToCart} variant="contained" sx={{ mt: 4, bgcolor: "#5C1620" }}>Add to cart</Button>
        </Box>
      </Box>}
    </Box>
    <Footer />
  </>;
}

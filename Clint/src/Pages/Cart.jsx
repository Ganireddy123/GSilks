import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import { setCart, setCartError, setCartLoading } from "../State/slices/cartSlice";
import AppAPI, { resolveAssetUrl } from "../API";

export default function Cart() {
  const dispatch = useDispatch();
  const { items, grandTotal, loading, error } = useSelector((state) => state.cart);
  useEffect(() => {
    dispatch(setCartLoading(true));
    try {
      AppAPI.getCart.get()
        .then((result) => dispatch(setCart(result.data?.cart || { items: [], grandTotal: 0, itemCount: 0 })))
        .catch((e) => dispatch(setCartError(e.message)));
    } catch (err) {
      dispatch(setCartError(err.message));
    }
  }, [dispatch]);

  const updateQuantity = (id, quantity) => {
    dispatch(setCartLoading(true));
    try {
      AppAPI.updateCart.put(undefined, { id, quantity })
        .then((result) => dispatch(setCart(result.data?.cart)))
        .catch((e) => dispatch(setCartError(e.message)));
    } catch (err) {
      dispatch(setCartError(err.message));
    }
  };

  const removeItem = (id) => {
    dispatch(setCartLoading(true));
    try {
      AppAPI.removeFromCart.delete({ id })
        .then((result) => dispatch(setCart(result.data?.cart)))
        .catch((e) => dispatch(setCartError(e.message)));
    } catch (err) {
      dispatch(setCartError(err.message));
    }
  };

  return <>
    <Navbar />
    <Box sx={{ px: { xs: 3, md: 8 }, py: 6, bgcolor: "#F6F2EA", minHeight: "65vh" }}>
      <Typography component="h1" sx={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "#5C1620", fontSize: 36, mb: 3 }}>Your Bag</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && !items.length && <Typography>Loading your bag...</Typography>}
      {!items.length && !loading && <Typography>Your bag is empty. <Link to="/products">Explore the collection</Link>.</Typography>}
      {items.map((item) => <Box key={item.id} sx={{ display: "grid", gridTemplateColumns: "80px 1fr auto auto", gap: 2, alignItems: "center", py: 2, borderBottom: "1px solid #ddd" }}>
        <Box component="img" src={resolveAssetUrl(item.image_url)} alt="" sx={{ width: 80, height: 96, objectFit: "cover", bgcolor: "white" }} />
        <Box><Typography fontWeight={600}>{item.product_name}</Typography><Typography color="text.secondary">₹{Number(item.price).toLocaleString("en-IN")}</Typography></Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button size="small" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</Button>
          <Typography>{item.quantity}</Typography>
          <Button size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
        </Box>
        <IconButton aria-label="Remove item" onClick={() => removeItem(item.id)}><DeleteIcon /></IconButton>
      </Box>)}
      {items.length > 0 && <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, mt: 4 }}><Typography variant="h6">Total ₹{Number(grandTotal).toLocaleString("en-IN")}</Typography><Button component={Link} to="/checkout" variant="contained" sx={{ bgcolor: "#5C1620" }}>Checkout</Button></Box>}
    </Box>
    <Footer />
  </>;
}

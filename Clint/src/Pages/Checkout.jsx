import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import { resetCart } from "../State/slices/cartSlice";
import { addOrder, setOrdersError, setOrdersLoading } from "../State/slices/ordersSlice";
import AppAPI from "../API";

const initialShipping = {
  shipping_name: "", shipping_phone: "", shipping_address_line1: "", shipping_address_line2: "",
  shipping_city: "", shipping_state: "", shipping_postal_code: "", shipping_country: "India",
};

export default function Checkout() {
  const dispatch = useDispatch();
  const [shipping, setShipping] = useState(initialShipping);
  const [error, setError] = useState("");
  const { items, grandTotal } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);

  const submitOrder = (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    dispatch(setOrdersLoading(true));
    const whatsappWindow = window.open("about:blank", "_blank");
    try {
      AppAPI.createOrder.post(undefined, { shipping, notes: "" })
        .then((result) => {
          const order = result.data?.order;
          if (!order) throw new Error("The order was created but its details could not be loaded.");
          dispatch(addOrder(order));
          dispatch(resetCart());
          const orderItems = (order.items || []).map((item) =>
            `- ${item.product_name} x ${item.quantity}: ₹${Number(item.subtotal || 0).toLocaleString("en-IN")}`
          );
          const address = [
            order.shipping_address_line1,
            order.shipping_address_line2,
            order.shipping_city,
            order.shipping_state,
            order.shipping_postal_code,
            order.shipping_country,
          ].filter(Boolean).join(", ");
          const message = [
            "New GSilks order",
            `Order: ${order.order_number}`,
            "",
            "Items:",
            ...orderItems,
            "",
            `Total: ₹${Number(order.total_amount || 0).toLocaleString("en-IN")}`,
            `Customer: ${order.shipping_name}`,
            `Phone: ${order.shipping_phone}`,
            `Delivery address: ${address}`,
          ].join("\n");
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
          if (whatsappWindow && !whatsappWindow.closed) {
            whatsappWindow.location.href = whatsappUrl;
          } else {
            window.location.assign(whatsappUrl);
          }
        })
        .catch((e) => {
          whatsappWindow?.close();
          setError(e.message);
          dispatch(setOrdersError(e.message));
        })
        .finally(() => setLoading(false));
    } catch (err) {
      whatsappWindow?.close();
      setError(err.message);
      dispatch(setOrdersError(err.message));
      setLoading(false);
    }
  };

  return <>
    <Navbar />
    <Box sx={{ px: { xs: 3, md: 8 }, py: 6, bgcolor: "#F6F2EA", minHeight: "65vh" }}>
      <Typography component="h1" sx={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "#5C1620", fontSize: 36, mb: 3 }}>Checkout</Typography>
      {!items.length && <Alert severity="info" sx={{ mb: 2 }}>Your bag is empty.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={submitOrder} sx={{ maxWidth: 720, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {Object.entries(initialShipping).map(([field]) => <TextField key={field} required={!field.endsWith("line2")} label={field.replace("shipping_", "").replaceAll("_", " ")} value={shipping[field]} onChange={(event) => setShipping({ ...shipping, [field]: event.target.value })} sx={field === "shipping_address_line1" || field === "shipping_address_line2" ? { gridColumn: "1 / -1" } : undefined} />)}
        <Typography sx={{ gridColumn: "1 / -1", alignSelf: "center" }}>Order total: ₹{Number(grandTotal).toLocaleString("en-IN")}</Typography>
        <Button type="submit" disabled={loading || !items.length} variant="contained" sx={{ gridColumn: "1 / -1", justifySelf: "start", bgcolor: "#5C1620" }}>{loading ? "Placing order..." : "Place order & WhatsApp"}</Button>
      </Box>
    </Box>
    <Footer />
  </>;
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import AppAPI from "../API";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    try {
      AppAPI.getOrder.get({ id })
        .then((result) => {
          if (active) setOrder(result.data?.order || null);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    } catch (err) {
      Promise.resolve().then(() => {
        if (active) setError(err.message);
      });
    }
    return () => { active = false; };
  }, [id]);

  return <>
    <Navbar />
    <Box sx={{ px: { xs: 3, md: 8 }, py: 6, bgcolor: "#F6F2EA", minHeight: "65vh" }}>
      <Typography component={Link} to="/orders" sx={{ color: "#7A1F2B", textDecoration: "none" }}>Back to orders</Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {!order && !error && <Typography sx={{ mt: 3 }}>Loading order...</Typography>}
      {order && <>
        <Typography component="h1" sx={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "#5C1620", fontSize: 36, mt: 3 }}>{order.order_number}</Typography>
        <Typography sx={{ mt: 1 }}>Status: {order.order_status} · Payment: {order.payment_status}</Typography>
        <Typography sx={{ mt: 2 }}>{order.shipping_name} · {order.shipping_phone}</Typography>
        <Typography>{order.shipping_address_line1}{order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}, {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}, {order.shipping_country}</Typography>
        <Box sx={{ mt: 4 }}>
          {order.items?.map((item) => <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1.5, borderBottom: "1px solid #ddd" }}><Typography>{item.product_name} × {item.quantity}</Typography><Typography>₹{Number(item.subtotal).toLocaleString("en-IN")}</Typography></Box>)}
          <Typography sx={{ textAlign: "right", mt: 2 }} variant="h6">Total ₹{Number(order.total_amount).toLocaleString("en-IN")}</Typography>
        </Box>
      </>}
    </Box>
    <Footer />
  </>;
}
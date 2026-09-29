import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import { replaceOrder, setOrders, setOrdersError, setOrdersLoading } from "../State/slices/ordersSlice";
import AppAPI from "../API";

export default function Orders() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.orders);
  useEffect(() => {
    dispatch(setOrdersLoading(true));
    try {
      AppAPI.getMyOrders.get()
        .then((result) => dispatch(setOrders(result.data?.orders || [])))
        .catch((e) => dispatch(setOrdersError(e.message)));
    } catch (err) {
      dispatch(setOrdersError(err.message));
    }
  }, [dispatch]);

  const cancelOrder = (id) => {
    dispatch(setOrdersLoading(true));
    try {
      AppAPI.cancelOrder.put(undefined, { id })
        .then((result) => dispatch(replaceOrder(result.data?.order)))
        .catch((e) => dispatch(setOrdersError(e.message)));
    } catch (err) {
      dispatch(setOrdersError(err.message));
    }
  };

  return <>
    <Navbar />
    <Box sx={{ px: { xs: 3, md: 8 }, py: 6, bgcolor: "#F6F2EA", minHeight: "65vh" }}>
      <Typography component="h1" sx={{ fontFamily: "var(--font-heading, Georgia, serif)", color: "#5C1620", fontSize: 36, mb: 3 }}>Your Orders</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && !items.length && <Typography>Loading orders...</Typography>}
      {!loading && !items.length && <Typography>No orders yet.</Typography>}
      {items.map((order) => <Box key={order.id} sx={{ py: 2.5, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Box><Typography fontWeight={700}>{order.order_number}</Typography><Typography color="text.secondary">{new Date(order.created_at).toLocaleDateString()} · {order.order_status}</Typography><Typography>₹{Number(order.total_amount).toLocaleString("en-IN")}</Typography></Box>
          <Box sx={{ display: "flex", gap: 1 }}><Button component={Link} to={`/orders/${order.id}`}>Details</Button>{!["CANCELLED", "DELIVERED", "SHIPPED"].includes(order.order_status) && order.payment_status !== "PAID" && <Button color="error" onClick={() => cancelOrder(order.id)}>Cancel order</Button>}</Box>
      </Box>)}
    </Box>
    <Footer />
  </>;
}

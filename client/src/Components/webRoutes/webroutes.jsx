import Home from "../../Pages/Home";
import Login from "../../Pages/Login";
import SignUp from "../../Pages/SignUp";
import ForgotPassword from "../../Pages/ForgotPassword";
import ProductListing from "../../Pages/ProductListing";
import ProductDetail from "../../Pages/Products";
import Cart from "../../Pages/Cart";
import Checkout from "../../Pages/Checkout";
import Orders from "../../Pages/Orders";
import OrderDetails from "../../Pages/OrderDetails";
import Profile from "../../Pages/Profile";
import AdminDashboard from "../../Pages/AdminDashboard";
import AdminProducts from "../../Pages/AdminProducts";
import AdminCategories from "../../Pages/AdminCategories";
import AdminOrders from "../../Pages/AdminOrders";
import AdminUsers from "../../Pages/AdminUsers";
import AdminLogin from "../../Pages/AdminLogin";
import AdminLayout from "../Admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

const DefaultRoutes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/register",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  { path: "/products", element: <ProductListing /> },
  { path: "/products/:id", element: <ProductDetail /> },
  { path: "/cart", element: <ProtectedRoute><Cart /></ProtectedRoute> },
  { path: "/checkout", element: <ProtectedRoute><Checkout /></ProtectedRoute> },
  { path: "/orders", element: <ProtectedRoute><Orders /></ProtectedRoute> },
  { path: "/orders/:id", element: <ProtectedRoute><OrderDetails /></ProtectedRoute> },
  { path: "/profile", element: <ProtectedRoute customerOnly><Profile /></ProtectedRoute> },
];

const AdminRoutes = [
  {
    path: "/admin",
    element: <ProtectedRoute admin><AdminLayout /></ProtectedRoute>,
    children: [
      { path: "profile", element: <Profile adminOnly /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "products", element: <AdminProducts /> },
      { path: "products/add", element: <AdminProducts /> },
      { path: "products/:id/edit", element: <AdminProducts /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "users", element: <AdminUsers /> },
    ],
  },
];

export { DefaultRoutes, AdminRoutes };
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, admin = false, customerOnly = false }) {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.user?.role);

  if (!token) return <Navigate to={admin ? "/admin/login" : "/login"} replace />;
  if (admin && role !== "ADMIN") return <Navigate to="/" replace />;
  if (customerOnly && role === "ADMIN") return <Navigate to="/admin/profile" replace />;
  if (customerOnly && role !== "CUSTOMER") return <Navigate to="/" replace />;
  return children;
}

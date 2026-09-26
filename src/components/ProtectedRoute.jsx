import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole = "admin" }) {
  const adminStr = localStorage.getItem("adminUser");
  const admin = adminStr ? JSON.parse(adminStr) : null;

  // For admin role, check if adminUser exists
  if (requiredRole === "admin") {
    if (!admin) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // For other roles, check user role
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

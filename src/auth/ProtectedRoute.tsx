import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for the session check before deciding where to send the user.
  if (isLoading) {
    return <p>Checking session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
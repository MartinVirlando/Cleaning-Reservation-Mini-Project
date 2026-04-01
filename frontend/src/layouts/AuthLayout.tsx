import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function AuthLayout() {
  const { isAuthenticated, user } = useAuth();

  
  if (isAuthenticated) {
    if (user?.role === "admin") return <Navigate to="/admin/services" replace />;
    if (user?.role === "cleaner") return <Navigate to="/cleaner/schedule" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <Outlet />
      </div>
    </div>
  );
}

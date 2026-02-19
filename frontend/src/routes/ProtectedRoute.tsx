import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../context/AuthContext";

type Props = {
  adminOnly?: boolean;
};

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Ngecek Autentikasi
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ngecek admin apa bukan
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/services" replace />;
  }


  return <Outlet />;
}
import { Routes, Route, Navigate } from "react-router-dom";

import ServicesPage from "../pages/services/ServicesPage";
import ServiceDetailPage from "../pages/services/ServiceDetailPage";
import BookingsPage from "../pages/bookings/BookingsPage";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminBookingsPage from "../pages/bookings/AdminBookingsPage";
import AadminServicesPage from "../pages/services/AdminServicesPage";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "../routes/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";


function DefaultRedirect() {
  const { user } = useAuth();

  if (user?.role === "admin"){
    return <Navigate to="/admin/services" replace />;
  }
  return <Navigate to="/services" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      
      {/* DEFAULT */}

      <Route path="/" element={<DefaultRedirect />} />
      

      {/* PUBLIC */}
      <Route element={<MainLayout/>}>
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
      </Route>
      

      {/* AUTH */}
      <Route element={<AuthLayout/>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>

      {/* ADMIN PROTECTED */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/services" element={<AadminServicesPage />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/services" replace />} />

    </Routes>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";

import ServicesPage from "../pages/services/ServicesPage";
import ServiceDetailPage from "../pages/services/ServiceDetailPage";
import BookingsPage from "../pages/bookings/BookingsPage";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ProtectedRoute from "../routes/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

export default function AppRouter() {
  return (
    <Routes>
      {/* DEFAULT */}
      <Route element={<MainLayout/>}>
        <Route path="/" element={<Navigate to="/services" replace />} />
      </Route>
      

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

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/services" replace />} />
    </Routes>
  );
}

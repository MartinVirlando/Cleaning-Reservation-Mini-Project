import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "../pages/home/HomePage";
import ServicesPage from "../pages/services/ServicesPage";
import ServiceDetailPage from "../pages/services/ServiceDetailPage";
import BookingsPage from "../pages/bookings/BookingsPage";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import AdminBookingsPage from "../pages/bookings/AdminBookingsPage";
import AadminServicesPage from "../pages/services/AdminServicesPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminCleanerPage from "../pages/admin/AdminCleanerPage";

import CleanerLayout from "../layouts/CleanerLayout";
import CleanerSchedulePage from "../pages/cleaner/CleanerSchedulePage";

import ProfilePage from "../pages/profile/ProfilePage";
import ChangePasswordPage from "../pages/profile/ChangePasswordPage";

import ProtectedRoute from "../routes/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";

function DefaultRedirect() {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin/services" replace />;
  if (user?.role === "cleaner") return <Navigate to="/cleaner/schedule" replace />;
  return <Navigate to="/" replace />;  // ← user biasa ke homepage
}

export default function AppRouter() {
  return (
    <Routes>

      {/* HOME */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
      </Route>

      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* USER PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      {/* ADMIN PROTECTED */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/services" element={<AadminServicesPage />} />
          <Route path="/admin/cleaners" element={<AdminCleanerPage />} />
        </Route>
      </Route>

      {/* CLEANER */}
      <Route element={<ProtectedRoute cleanerOnly />}>
        <Route element={<CleanerLayout />}>
          <Route path="/cleaner/schedule" element={<CleanerSchedulePage />} />
          <Route path="/cleaner/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
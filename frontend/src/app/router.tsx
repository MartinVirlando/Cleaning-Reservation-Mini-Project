import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";
import ServicesPage from "../pages/services/Services";
import ServiceDetail from "../pages/services/ServiceDetail";
import ProtectedRoute from "../routes/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <div>Page not found</div>,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <ServicesPage /> },
          { path: "services", element: <ServicesPage /> },
          { path: "services/:id", element: <ServiceDetail /> },
        ],
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
]);

import { Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-blue-900 flex items-center justify-between px-6 py-0 z-50 h-16">
        <div className="text-white font-bold text-lg">Cleaning Service</div>

        <div className="flex items-center gap-6">
          <div className="text-white opacity-80 text-sm">
            {user ? user.email : ""}
          </div>

          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            items={[
              {
                key: "services",
                label: "Services",
                onClick: () => navigate("/services"),
              },
              {
                key: "logout",
                label: "Logout",
                onClick: () => {
                  logout();
                  navigate("/login");
                },
              },
              {
                key: "bookings",
                label: "Booking List",
                onClick: () => {
                  navigate("/bookings")
                }
              },
            ]}
          />
        </div>
      </header>

      <main className="mt-16 p-6 bg-gray-100 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

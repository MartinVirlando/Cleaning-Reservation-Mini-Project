import { Layout, Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between">
        <div className="text-white font-bold text-lg">Cleaning Service</div>

        <div className="flex items-center gap-6">
          <div className="text-white opacity-80">
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
      </Header>

      <Content className="p-6 bg-gray-100">
        <Outlet />
      </Content>
    </Layout>
  );
}

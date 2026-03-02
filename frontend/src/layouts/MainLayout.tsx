import { Menu, Layout, Dropdown, Button } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { MenuProps } from "antd";
import { useAuth } from "../context/AuthContext";
import {
  UserOutlined,
  KeyOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated } = useAuth();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = location.pathname === "/";
  const isTransparant = isHome && !scrolled;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "password",
      label: "Change Password",
      icon: <KeyOutlined />,
      onClick: () => navigate("/change-password"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      danger: true,
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-8"
        style={{
          background: isTransparant ? "transparent" : "#1e3a5f",
          boxShadow: isTransparant ? "none" : "0 2px 12px rgba(0,0,0,0.2)",
          height: 64,
        }}>
        <div className="flex justify-between items-center">
          <h1
            className="text-white text-xl font-bold cursor-pointer"
            onClick={() => navigate("/")}  
          >
            CleanPro
          </h1>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              
              <>
                <Menu
                  theme="dark"
                  mode="horizontal"
                  style={{background: "transparent"}}
                  selectable={false}
                  items={[
                    {
                      key: "home",
                      label: "Home",
                      onClick: () => navigate("/"),
                    },
                    {
                      key: "services",
                      label: "Services",
                      onClick: () => navigate("/services"),
                    },
                    {
                      key: "bookings",
                      label: "Booking List",
                      onClick: () => navigate("/bookings"),
                    },
                  ]}
                />
                <Dropdown
                  menu={{ items: profileMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div className="flex items-center gap-2 cursor-pointer text-white hover:text-gray-200 transition-colors">
                    <UserOutlined className="text-lg" />
                    <span className="max-w-[150px] truncate">
                      {user?.name || "User"}
                    </span>
                    <DownOutlined className="text-xs" />
                  </div>
                </Dropdown>
              </>
            ) : (
          
              <div className="flex items-center gap-3">
                <Menu
                  theme="dark"
                  mode="horizontal"
                  style={{ background: "transparent" }}
                  selectable={false}
                  items={[
                    {
                      key: "home",
                      label: "Home",
                      onClick: () => navigate("/"),
                    },
                    {
                      key: "services",
                      label: "Services",
                      onClick: () => navigate("/services"),
                    },
                  ]}
                />
                <Button
                  onClick={() => navigate("/login")}
                  className="border-white text-white hover:text-blue-900"
                  ghost
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  type="primary"
                  className="bg-white text-blue-900 border-white hover:bg-blue-50"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>

      <Content>
        <div className={isHome ? "" : "pt-16"}>
          <Outlet />
        </div>
        
      </Content>
    </Layout>
  );
}
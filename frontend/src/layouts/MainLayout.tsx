import { Menu, Layout, Dropdown, Button, Drawer } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { MenuProps } from "antd";
import { useAuth } from "../context/AuthContext";
import {
  UserOutlined, KeyOutlined, LogoutOutlined,
  DownOutlined, MenuOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setDrawerOpen(false);
  };

  const profileMenuItems: MenuProps["items"] = [
    { key: "profile", label: "Profile", icon: <UserOutlined />, onClick: () => navigate("/profile") },
    { key: "password", label: "Change Password", icon: <KeyOutlined />, onClick: () => navigate("/change-password") },
    { type: "divider" },
    { key: "logout", label: "Logout", danger: true, icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  // Menu items untuk drawer (mobile)
  const mobileMenuItems = isAuthenticated ? [
    { key: "home", label: "Home", onClick: () => { navigate("/"); setDrawerOpen(false); } },
    { key: "services", label: "Services", onClick: () => { navigate("/services"); setDrawerOpen(false); } },
    { key: "bookings", label: "Booking List", onClick: () => { navigate("/bookings"); setDrawerOpen(false); } },
    { type: "divider" as const },
    { key: "profile", label: "Profile", icon: <UserOutlined />, onClick: () => { navigate("/profile"); setDrawerOpen(false); } },
    { key: "password", label: "Change Password", icon: <KeyOutlined />, onClick: () => { navigate("/change-password"); setDrawerOpen(false); } },
    { key: "logout", label: "Logout", danger: true, icon: <LogoutOutlined />, onClick: handleLogout },
  ] : [
    { key: "home", label: "Home", onClick: () => { navigate("/"); setDrawerOpen(false); } },
    { key: "services", label: "Services", onClick: () => { navigate("/services"); setDrawerOpen(false); } },
    { key: "login", label: "Login", onClick: () => { navigate("/login"); setDrawerOpen(false); } },
    { key: "register", label: "Register", onClick: () => { navigate("/register"); setDrawerOpen(false); } },
  ];

  return (
    <Layout className="min-h-screen">
      <Header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8"
        style={{
          background: isTransparant ? "transparent" : "#1e3a5f",
          boxShadow: isTransparant ? "none" : "0 2px 12px rgba(0,0,0,0.2)",
          height: 64,
        }}
      >
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <h1 className="text-white text-xl font-bold cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}>
            CleanPro
          </h1>

          {/* ── DESKTOP nav ── */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Menu
                  theme="dark" mode="horizontal"
                  style={{ background: "transparent" }}
                  selectable={false}
                  disabledOverflow
                  items={[
                    { key: "home", label: "Home", onClick: () => navigate("/") },
                    { key: "services", label: "Services", onClick: () => navigate("/services") },
                    { key: "bookings", label: "Booking List", onClick: () => navigate("/bookings") },
                  ]}
                />
                <Dropdown menu={{ items: profileMenuItems }} trigger={["click"]} placement="bottomRight">
                  <div className="flex items-center gap-2 cursor-pointer text-white hover:text-gray-200 transition-colors">
                    <UserOutlined className="text-lg" />
                    <span className="max-w-[150px] truncate">{user?.name || "User"}</span>
                    <DownOutlined className="text-xs" />
                  </div>
                </Dropdown>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Menu
                  theme="dark" mode="horizontal"
                  style={{ background: "transparent" }}
                  selectable={false}
                  items={[
                    { key: "home", label: "Home", onClick: () => navigate("/") },
                    { key: "services", label: "Services", onClick: () => navigate("/services") },
                  ]}
                />
                <Button onClick={() => navigate("/login")} className="border-white text-white" ghost>Login</Button>
                <Button onClick={() => navigate("/register")} type="primary" className="bg-white text-blue-900 border-white">Register</Button>
              </div>
            )}
          </div>

          {/* ── MOBILE hamburger ── */}
          <button
            className="flex md:hidden items-center justify-center w-10 h-10 text-white"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuOutlined style={{ fontSize: 20 }} />
          </button>
        </div>
      </Header>

      {/* ── MOBILE Drawer ── */}
      <Drawer
        title={<span className="font-bold text-gray-800">CleanPro</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={260}
      >
        {isAuthenticated && (
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserOutlined className="text-blue-600" />
            </div>
            <span className="font-semibold text-gray-800">{user?.name || "User"}</span>
          </div>
        )}
        <Menu
          mode="vertical"
          selectable={false}
          items={mobileMenuItems}
          style={{ border: "none" }}
        />
      </Drawer>

      <Content>
        <div className={isHome ? "" : "pt-16"}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
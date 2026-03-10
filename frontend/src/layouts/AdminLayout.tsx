import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Layout, Menu, Drawer } from "antd";
import { useState } from "react";
import {
  AppstoreOutlined, BookOutlined, LogoutOutlined,
  TeamOutlined, MenuOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDrawerOpen(false);
  };

  const menuItems = [
    { key: "services", label: "Manage Services", icon: <AppstoreOutlined />, onClick: () => { navigate("/admin/services"); setDrawerOpen(false); } },
    { key: "bookings", label: "Manage Bookings", icon: <BookOutlined />, onClick: () => { navigate("/admin/bookings"); setDrawerOpen(false); } },
    { key: "cleaners", label: "Manage Cleaners", icon: <TeamOutlined />, onClick: () => { navigate("/admin/cleaners"); setDrawerOpen(false); } },
    { key: "logout", label: "Logout", danger: true, icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="bg-blue-900 px-4 md:px-6">
        <div className="flex justify-between items-center h-full">
          <h1 className="text-white text-xl font-bold flex-shrink-0">Admin Panel</h1>

          {/* ── DESKTOP ── */}
          <div className="hidden md:flex flex-1 justify-end">
            <Menu
              theme="dark"
              mode="horizontal"
              className="bg-blue-900"
              disabledOverflow
              selectable={false}
              items={menuItems}
            />
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
        title={<span className="font-bold text-gray-800">Admin Panel</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={260}
      >
        <Menu
          mode="vertical"
          selectable={false}
          items={menuItems}
          style={{ border: "none" }}
        />
      </Drawer>

      <Content className="p-6 bg-gray-50">
        <Outlet />
      </Content>
    </Layout>
  );
}
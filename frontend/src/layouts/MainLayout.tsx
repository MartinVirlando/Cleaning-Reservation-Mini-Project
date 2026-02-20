import { Menu, Layout, Dropdown } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import  type { MenuProps } from "antd";
import { useAuth } from "../context/AuthContext";
import {
    UserOutlined,
    KeyOutlined,
    LogoutOutlined,
    DownOutlined,
} from "@ant-design/icons";

const { Header, Content} = Layout;


export default function MainLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]


  return (
    <Layout className="min-h-screen">
      <Header className="bg-blue-900">
        <div className="flex justify-between items-center">
          <h1
            className="text-white text-xl font-bold cursor-pointer"
            onClick={() => navigate("/services")}
          >
            Cleaning Service
          </h1>

          <div className="flex items-center gap-4">
            {/* Navigation Menu */}
            <Menu
              theme="dark"
              mode="horizontal"
              className="bg-blue-900"
              selectable={false}
              items={[
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

            {/* Profile Dropdown */}
            <Dropdown
              menu={{ items: profileMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer text-white hover:text-gray-200 transition-colors">
                <UserOutlined className="text-lg" />
                <span className="max-w-[150px] truncate">
                  {user?.email || "User"}
                </span>
                <DownOutlined className="text-xs" />
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>

      <Content className="p-6 bg-gray-50">
        <Outlet />
      </Content>
    </Layout>
  );
}

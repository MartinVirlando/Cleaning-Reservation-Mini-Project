import { Layout, Dropdown } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { useAuth } from "../context/AuthContext";
import {
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;

export default function CleanerLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "password",
      label: "Change Password",
      icon: <KeyOutlined />,
      onClick: () => navigate("/cleaner/change-password"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header style={{ background: "#1e3a5f" }}>
        <div className="flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">
            Cleaner Panel
          </h1>

          <div className="flex items-center gap-4">
           
            <Dropdown
              menu={{ items: profileMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer text-white hover:text-gray-200 transition-colors">
                <UserOutlined className="text-lg" />
                <span className="max-w-[150px] truncate">
                  {user?.name || "Cleaner"}
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
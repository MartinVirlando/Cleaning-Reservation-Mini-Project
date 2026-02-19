import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Layout, Menu} from "antd";
import {
    AppstoreOutlined,
    BookOutlined,
    LogoutOutlined,
} from "@ant-design/icons";

const { Header, Content} = Layout;



export default function AuthProvider() {
    const navigate = useNavigate();
    const { logout} = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (

        <Layout className="min-h-screen">
            <Header className="bg-blue-900">
                <div className="flex justify-between items-center">

                    <h1 className="text-white text-xl font-bold">Admin Panel</h1>

                    <Menu
                    theme="dark"
                    mode="horizontal"
                    className="bg-blue-900 flex-1 justify-end"
                        items = {[
                            {
                                key: "services",
                                label: "Manage Services",
                                icon: <AppstoreOutlined />,
                                onClick: () => navigate("/admin/services"),
                            },
                            {
                                key: "bookings",
                                label: "Manage Bookings",
                                icon: <BookOutlined />,
                                onClick: () => navigate("/admin/bookings"),
                            },
                            {
                                key: "logout",
                                label: "Logout",
                                icon: <LogoutOutlined />,
                                onClick: handleLogout,  
                            }
                        ]}
                    />
                </div>
            </Header>

            <Content className="p-6 bg-gray-50">
                <Outlet/>
            </Content>

        </Layout>
    );
}
import { Typography } from "antd";

const { Title } = Typography;




export default function ForgotPassword() {
    return (
        <div className="w-full max-w-md">
            <Title level={3} className="text-center mb-6">
                Forgot Password
            </Title>
           
        </div>
    );
}
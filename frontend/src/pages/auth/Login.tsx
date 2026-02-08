import { Typography } from "antd";
import { Link } from "react-router-dom";
import LoginForm from "../../components/organisms/LoginForm";

const { Title } = Typography;

export default function Login() {
  return (
    <div className="w-full max-w-md">
      <Title level={3} className="text-center mb-6">
        Login
      </Title>

      <LoginForm />

      <div className="mt-4 flex justify-between text-sm">
        {/* <Link to="/forgot-password" className="text-blue-500 hover:underline">
          Forgot password?
        </Link> */}

        <Link to="/register" className="text-blue-500 hover:underline">
          Register
        </Link>

      </div>
    </div>
  );
}

import { Typography } from "antd";
import { Link } from "react-router-dom";
import RegisterForm from "../../components/organisms/RegisterForm";

const { Title } = Typography;

export default function Register() {
  return (
    <div className="w-full max-w-md">
      <Title level={3} className="text-center mb-6">
        Register
      </Title>

      <RegisterForm />

      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-blue-500 hover:underline">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}

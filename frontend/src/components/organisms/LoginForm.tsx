import { Form, message } from "antd";
import { Button } from "../atoms/Buttons";
import { useNavigate } from "react-router-dom";
import FormInput from "../molecules/FormInput";
import { login as loginService } from "../../services/authService";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: loginService,

    onSuccess: (data, variables) => {
      
      const user = {
        id: 0,
        name: "",
        email: variables.email,
      };

      login(data.token, user);

      message.success("Login successful!");
      navigate("/services");
    },

    onError: () => {
      message.error("Invalid email or password");
    },
  });

  const onFinish = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <FormInput
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Invalid email!" },
        ]}
      />

      <FormInput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        rules={[{ required: true, message: "Please input your password!" }]}
      />

      <Button
        htmlType="submit"
        type="primary"
        className="w-full"
        loading={mutation.isPending}
      >
        Login
      </Button>
    </Form>
  );
}

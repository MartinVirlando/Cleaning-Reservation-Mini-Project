import { Button } from "../atoms/Buttons";
import { Form } from "antd";
import FormInput from "../molecules/FormInput";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { message } from "antd";



type RegisterFormValues = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone : string;
};

export default function RegisterForm() {

    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: RegisterFormValues) => {
  try {
    await api.post("/auth/register", {
      username: values.username,
      email: values.email,
      password: values.password,
      phone: values.phone,
    });

    message.success("Register success!");
    navigate("/login");
  } catch (err) {
    message.error("Register failed");
  }
};


    return(
       
        <Form
            layout="vertical"
            onFinish={onFinish}
            form={form}
            autoComplete="off">

            <FormInput
                name="username"
                label="Username"
                placeholder="Enter your username"
                rules={[
                    { required: true, message: "Please input your username!" }]}
            />
            <FormInput
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!"}]}
            />
            <FormInput
                name="phone"
                label="Phone Number"
                placeholder="Enter your phone number (e.g. 08123456789)"
                rules={[
                    { required: true, message: "Please input your phone number!" },
                    { pattern: /^[0-9+\-\s]{8,15}$/, message: "Please enter a valid phone number!" }
                ]}
            />
            <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                rules={[
                    {required : true, message: "Please enter your password"},
                    { min: 6, message: "Password must be at least 6 characters long" }]}
            />
            <FormInput
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                rules={[
                    {required: true, message: "Confirm your password!"},
                    {
                        validator(_ : unknown, value: string) {
                            if (!value || form.getFieldValue("password") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Passwords do not match!"));
                    },
                },
            ]}
            />
            <Button type="primary" htmlType="submit">Register</Button>
        </Form>
       
    );
}
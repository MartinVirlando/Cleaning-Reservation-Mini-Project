import { useEffect } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/userService";
import { useNavigate } from "react-router-dom";


const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();


  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.name,  
        email: user.email,
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      
      login(data.token, data.user);
      message.success("Profile updated successfully!");
      navigate("/services");
    },
    onError: (error: any) => {
      
      const msg = error?.response?.data?.message || "Failed to update profile";
      message.error(msg);
    },
  });

  return (
    <div className="max-w-lg mx-auto mt-8">
      <Button onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <Card>
        <Title level={3} className="mb-1">
          Edit Profile
        </Title>
        <Text type="secondary" className="block mb-6">
          Update your username and email address
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: "Username is required" },
              { min: 3, message: "Minimum 3 characters" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Your username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your@email.com"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={mutation.isPending}
          >
            Save Changes
          </Button>
        </Form>
      </Card>
    </div>
  );
}
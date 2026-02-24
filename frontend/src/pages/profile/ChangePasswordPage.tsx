import { Form, Input, Button, Card, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../services/userService";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function ChangePasswordPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
        message.success("Password changed successfully!");
        form.resetFields();
    },
    onError: (error: any) => {
        const msg = error?.response?.data?.message || "Failed to change password";
        message.error(msg);
    
    },
  });

  const onFinish = (values : any) => {
        mutation.mutate(values);
  
        mutation.mutate({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        });
        navigate("/services");
   };

    return (
        <div className="max-w-lg mx-auto mt-8">
            <Button onClick={() => navigate(-1)} className="mb-4">Back</Button>
            <Card>
                <Title level={3} className="mb-1">
                    Change Password
                </Title>

                <Text type="secondary" className="block mb-6">
                    Enter your current password
                </Text>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: "Current password is required"}]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Your current password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[{ required: true, message: "New password is required"},
                                { min: 6, message: "Minimum 6 characters"}
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Your new password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[{ required: true, message: "Please confirm your new password"},
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("newPassword") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match"));
                                    },
                                }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirm your new password"
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
                        Change Password
                    </Button>
                </Form>
            </Card>
        </div>
    );
}
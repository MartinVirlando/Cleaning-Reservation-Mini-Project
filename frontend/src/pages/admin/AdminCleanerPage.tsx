import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input,message, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

type Cleaner = {
  id: number;
  username: string;
  email: string;
};

export default function AdminCleanerPage() {
  const { token } = useAuth();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchCleaners = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/admin/cleaners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCleaners(data);
    } catch {
      message.error("Gagal ambil data cleaner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCleaners();
  }, [token]);

  const handleAddCleaner = async (values: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      setSubmitLoading(true);
      const res = await fetch("http://localhost:8080/api/admin/cleaners", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.message || "Gagal tambah cleaner");
        return;
      }

      message.success("Cleaner berhasil ditambahkan!");
      setModalOpen(false);
      form.resetFields();
      fetchCleaners(); 
    } catch {
      message.error("Gagal tambah cleaner");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/cleaners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      message.success("Cleaner berhasil dihapus!");
      fetchCleaners();
    } catch {
      message.error("Gagal hapus cleaner");
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Action",
      render: (_: any, record: Cleaner) => (
        <Popconfirm
          title="Hapus cleaner ini?"
          description="Tindakan ini tidak bisa dibatalkan"
          onConfirm={() => handleDelete(record.id)}
          okText="Hapus"
          cancelText="Batal"
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cleaner Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Add Cleaner
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={cleaners}
        loading={loading}
      />

      
      <Modal
        title="Add New Cleaner"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null} 
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCleaner}
          className="mt-4"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: "Username is required" },
              { min: 3, message: "Minimum 3 characters" },
            ]}
          >
            <Input placeholder="Cleaner username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="cleaner@email.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setModalOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              Add Cleaner
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
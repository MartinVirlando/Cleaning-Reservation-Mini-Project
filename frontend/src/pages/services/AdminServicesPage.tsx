import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

type Service = {
  ID: number;
  Name: string;
  Description: string;
  Price: number;
  Duration: number;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  const { token } = useAuth();

  // Fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setServices(data);
    } catch (error) {
      message.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchServices();
  }, [token]);

  
  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      form.setFieldsValue({
        name: service.Name,
        description: service.Description,
        price: service.Price,
        duration: service.Duration,
      });
    } else {
      setEditingService(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (values: any) => {
    try {
      const url = editingService
        ? `http://localhost:8080/api/admin/services/${editingService.ID}`
        : "http://localhost:8080/api/admin/services";

      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save");

      message.success(
        editingService
          ? "Service updated successfully"
          : "Service created successfully"
      );
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      message.error("Failed to save service");
    }
  };

  // Delete service
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      message.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      message.error("Failed to delete service");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "description",
    },
    {
      title: "Price",
      dataIndex: "Price",
      key: "price",
      render: (price: number) => `Rp ${price.toLocaleString("id-ID")}`,
    },
    {
      title: "Duration (min)",
      dataIndex: "Duration",
      key: "duration",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Service) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this service?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.ID)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Management</h1>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Add Service
        </Button>
      </div>

      <Table
        dataSource={services}
        columns={columns}
        rowKey="ID"
        loading={loading}
      />

      <Modal
        title={editingService ? "Edit Service" : "Add Service"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Service Name"
            name="name"
            rules={[{ required: true, message: "Please input service name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input description" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Price (Rp)"
            name="price"
            rules={[{ required: true, message: "Please input price" }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Duration (minutes)"
            name="duration"
            rules={[{ required: true, message: "Please input duration" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingService ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
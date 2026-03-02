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
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

type Service = {
  ID: number;
  Name: string;
  Description: string;
  Price: number;
  Duration: number;
  DeletedAt?: string | null;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();
  const { token } = useAuth();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setServices(data);
    } catch {
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

  const handleSubmit = async (values: any) => {
    try {
      const url = editingService
        ? `http://localhost:8080/api/admin/services/${editingService.ID}`
        : "http://localhost:8080/api/admin/services";
      const res = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      message.success(editingService ? "Service updated!" : "Service created!");
      setIsModalOpen(false);
      fetchServices();
    } catch {
      message.error("Failed to save service");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      message.success("Service deleted");
      fetchServices();
    } catch {
      message.error("Failed to delete service");
    }
  };

  const columns = [
    {
      title: "Service",
      key: "service",
      render: (_: any, record: Service) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0"
            style={{ background: "#eff6ff", color: "#2563eb", fontFamily: "monospace" }}
          >
           ◈
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{record.Name}</p>
            <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">
              {record.Description || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "Price",
      key: "price",
      render: (price: number) => (
        <div>
          <p className="font-bold text-gray-800 text-sm">
            Rp {price.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-400">per session</p>
        </div>
      ),
    },
    {
      title: "Duration",
      dataIndex: "Duration",
      key: "duration",
      render: (dur: number) => (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
        >
          <ClockCircleOutlined />
          {dur} min
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Service) => (
        <Space size={8}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            className="!rounded-lg !text-xs !font-semibold"
            style={{ borderColor: "#3b82f6", color: "#3b82f6" }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this service?"
            description="Service akan di-soft delete dan tidak muncul di public."
            onConfirm={() => handleDelete(record.ID)}
            okText="Delete"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="!rounded-lg !text-xs !font-semibold"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: "#f8fafc" }}>

      {/* ── HEADER ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Service Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola semua layanan cleaning yang tersedia
        </p>
      </div>


      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">All Services</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="!rounded-xl !font-semibold"
            style={{ background: "#2563eb", borderColor: "#2563eb" }}
          >
            Add Service
          </Button>
        </div>

        <Table
          rowKey="ID"
          columns={columns}
          dataSource={services}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: 700 }}
        />
      </div>

      {/* ── MODAL ── */}
      <Modal
        title={
          <span className="font-bold text-gray-800">
            {editingService ? "Edit Service" : "Add New Service"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="!rounded-2xl"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            label={<span className="text-sm font-semibold text-gray-700">Service Name</span>}
            name="name"
            rules={[{ required: true, message: "Wajib diisi" }]}
          >
            <Input className="!rounded-xl" placeholder="contoh: Deep Cleaning Premium" />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-semibold text-gray-700">Description</span>}
            name="description"
            rules={[{ required: true, message: "Wajib diisi" }]}
          >
            <Input.TextArea
              rows={3}
              className="!rounded-xl"
              placeholder="Deskripsi singkat layanan..."
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-semibold text-gray-700">Price (Rp)</span>}
              name="price"
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber
                min={0}
                className="!w-full !rounded-xl"
                placeholder="150000"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-semibold text-gray-700">Duration (menit)</span>}
              name="duration"
              rules={[{ required: true, message: "Wajib diisi" }]}
            >
              <InputNumber min={1} className="!w-full !rounded-xl" placeholder="60" />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-2">
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="!rounded-xl !font-semibold"
              >
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="!rounded-xl !font-semibold"
                style={{ background: "#2563eb", borderColor: "#2563eb" }}
              >
                {editingService ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
  MailOutlined,
} from "@ant-design/icons";
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
      setCleaners(await res.json());
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
      title: "Cleaner",
      key: "cleaner",
      render: (_: any, record: Cleaner) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            ◈
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {record.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <MailOutlined className="text-gray-400 text-xs" />
          <span className="text-sm text-gray-600">{email}</span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Cleaner) => (
        <Popconfirm
          title="Hapus cleaner ini?"
          description="Tindakan ini tidak bisa dibatalkan."
          onConfirm={() => handleDelete(record.id)}
          okText="Hapus"
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
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: "#f8fafc" }}>

      {/* ── HEADER ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Cleaner Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola akun cleaner yang terdaftar
        </p>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 gap-4 mb-8" style={{ maxWidth: 480 }}>
        {[
          {
            label: "Total Cleaners",
            value: cleaners.length,
            icon: <TeamOutlined />,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm`}
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} text-lg mb-3`}
            >
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* TABLE CARD  */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Table header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">All Cleaners</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            className="!rounded-xl !font-semibold"
            style={{ background: "#2563eb", borderColor: "#2563eb" }}
          >
            Add Cleaner
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={cleaners}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </div>

      {/* MODAL */}
      <Modal
        title={
          <span className="font-bold text-gray-800">Add New Cleaner</span>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCleaner}
          className="mt-4"
        >
          <Form.Item
            label={<span className="text-sm font-semibold text-gray-700">Username</span>}
            name="username"
            rules={[
              { required: true, message: "Username wajib diisi" },
              { min: 3, message: "Minimal 3 karakter" },
            ]}
          >
            <Input className="!rounded-xl" placeholder="contoh: budi_cleaner" />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-semibold text-gray-700">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Email wajib diisi" },
              { type: "email", message: "Format email tidak valid" },
            ]}
          >
            <Input className="!rounded-xl" placeholder="cleaner@email.com" />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-semibold text-gray-700">Password</span>}
            name="password"
            rules={[
              { required: true, message: "Password wajib diisi" },
              { min: 6, message: "Minimal 6 karakter" },
            ]}
          >
            <Input.Password className="!rounded-xl" placeholder="Min. 6 karakter" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              onClick={() => { setModalOpen(false); form.resetFields(); }}
              className="!rounded-xl !font-semibold"
            >
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              className="!rounded-xl !font-semibold"
              style={{ background: "#2563eb", borderColor: "#2563eb" }}
            >
              Add Cleaner
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Select, Popconfirm} from "antd";
import { useAuth } from "../../context/AuthContext";
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, CalendarOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";

type Booking = {
  ID: number;
  User: { id: number; email: string };
  Service: { ID: number; Name: string; Price: number };
  Date: string;
  Time: string;
  Address: string;
  Status: string;
  PaymentStatus: string;
  Cleaner?: { ID: number; username: string };
};

type Cleaner = {
  id: number;
  username: string;
  email: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedCleanerId, setSelectedCleanerId] = useState<number | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      message.error("Gagal ambil data booking");
    } finally {
      setLoading(false);
    }
  };

  const fetchCleaners = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/admin/cleaners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setCleaners(await res.json());
    } catch {
      message.error("Gagal ambil data cleaner");
    }
  };

  useEffect(() => {
    if (token) { fetchBookings(); fetchCleaners(); }
  }, [token]);

  const openApproveModal = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setSelectedCleanerId(null);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedCleanerId) { message.warning("Pilih cleaner terlebih dahulu"); return; }
    try {
      setApproveLoading(true);
      const res = await fetch(`http://localhost:8080/api/admin/bookings/${selectedBookingId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ cleaner_id: selectedCleanerId }),
      });
      if (!res.ok) throw new Error();
      message.success("Booking approved!");
      setApproveModalOpen(false);
      fetchBookings();
    } catch {
      message.error("Gagal approve booking");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/bookings/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      message.success("Booking rejected");
      fetchBookings();
    } catch {
      message.error("Gagal reject booking");
    }
  };

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.Status === "pending").length;
  const paidBookings = bookings.filter(b => b.PaymentStatus === "paid").length;
  const approvedBookings = bookings.filter(b => b.Status === "approved").length;

  const userOptions = [...new Set(bookings.map(b => b.User.email))].map(email => ({
    value: email, label: email,
  }));

  const filteredBookings = bookings.filter(b => {
    if (filterUser && b.User.email !== filterUser) return false;
    if (filterStatus && b.Status !== filterStatus) return false;
    return true;
  });

  const columns = [
    {
      title: "User",
      dataIndex: ["User", "email"],
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <UserOutlined className="text-blue-600 text-xs" />
          </div>
          <span className="text-sm font-medium text-gray-700">{email}</span>
        </div>
      ),
    },
    {
      title: "Service",
      dataIndex: ["Service", "Name"],
      render: (name: string) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: "Schedule",
      render: (_: any, record: Booking) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarOutlined /> {record.Date}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ClockCircleOutlined /> {record.Time}
          </div>
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "Address",
      render: (addr: string) => <span className="text-sm text-gray-600 max-w-[150px] truncate block">{addr}</span>,
    },
    {
      title: "Cleaner",
      render: (_: any, record: Booking) => record.Cleaner
        ? <span className="text-sm font-medium text-emerald-600">{record.Cleaner.username}</span>
        : <span className="text-gray-400 text-sm">-</span>,
    },
    {
      title: "Payment",
      dataIndex: "PaymentStatus",
      render: (status: string) => status === "paid"
        ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircleOutlined /> Lunas</span>
        : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200"><CloseCircleOutlined /> Belum Bayar</span>,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (status: string) => {
        const config: Record<string, { color: string; bg: string; border: string }> = {
          approved: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
          rejected: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
          pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          canceled: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
        };
        const c = config[status] || config.pending;
        return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${c.color} ${c.bg} border ${c.border}`}>{status.toUpperCase()}</span>;
      },
    },
    {
      title: "Action",
      render: (_: any, record: Booking) => (
        <Space size={8}>
          <Button
            type="primary"
            size="small"
            onClick={() => openApproveModal(record.ID)}
            disabled={record.Status !== "pending" || record.PaymentStatus !== "paid"}
            className="!rounded-lg !text-xs !font-semibold"
            style={{ background: record.Status === "pending" && record.PaymentStatus === "paid" ? "#10b981" : undefined, borderColor: "transparent" }}
          >
            Approve
          </Button>
          <Popconfirm
            title="Reject booking ini?"
            description="Tindakan ini tidak bisa dibatalkan"
            onConfirm={() => handleReject(record.ID)}
            okText="Reject"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" disabled={record.Status !== "pending"} className="!rounded-lg !text-xs !font-semibold">
              Reject
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Booking Management</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor and manage all customer bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: totalBookings, icon: <CalendarOutlined />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Pending", value: pendingBookings, icon: <ClockCircleOutlined />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Lunas", value: paidBookings, icon: <DollarOutlined />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Approved", value: approvedBookings, icon: <CheckCircleOutlined />, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} text-lg mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-800">All Bookings</h2>
          <div className="flex flex-wrap gap-3">
            <Select
              placeholder="Filter by user..."
              allowClear
              style={{ width: 200 }}
              options={userOptions}
              onChange={(val) => setFilterUser(val ?? null)}
              size="small"
            />
            <Select
              placeholder="Filter by status..."
              allowClear
              style={{ width: 160 }}
              onChange={(val) => setFilterStatus(val ?? null)}
              size="small"
              options={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "canceled", label: "Canceled" },
              ]}
            />
          </div>
        </div>

        <Table
          rowKey="ID"
          columns={columns}
          dataSource={filteredBookings}
          loading={loading}
          scroll={{ x: 900}}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          rowClassName="hover:bg-gray-50 transition-colors"
          className="admin-bookings-table"
        />
      </div>

      {/* Approve Modal */}
      <Modal
        title={<span className="font-bold text-gray-800">Assign Cleaner</span>}
        open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)}
        onOk={handleApproveConfirm}
        okText="Approve Booking"
        cancelText="Batal"
        confirmLoading={approveLoading}
        okButtonProps={{ style: { background: "#10b981", borderColor: "#10b981" } }}
      >
        <p className="text-gray-500 text-sm mb-4">Pilih cleaner yang akan ditugaskan untuk booking ini:</p>
        <Select
          placeholder="Pilih cleaner..."
          style={{ width: "100%" }}
          onChange={(val) => setSelectedCleanerId(val)}
          value={selectedCleanerId}
          options={cleaners.map((c) => ({ value: c.id, label: `${c.username} (${c.email})` }))}
        />
      </Modal>
    </div>
  );
}
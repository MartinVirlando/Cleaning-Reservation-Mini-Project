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
  CompletionImage?: string;
  ComplainNote?: string;
  Rating?: { Stars: number; Comment: string };
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

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveTargetId, setResolveTargetId] = useState<number | null>(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveBooking, setResolveBooking] = useState<Booking | null>(null);

  const [ratingPopup, setRatingPopup] = useState<{Stars: number; Comment: string} |null>(null);

  const handleResolve = async (action: "approve" | "reject") => {
    try {
      setResolveLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/admin/bookings/${resolveTargetId}/resolve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      if (!res.ok) throw new Error();
      message.success(action === "approve" ? "Booking di-approve sebagai done" : "Cleaner diminta kerja ulang");
      setResolveModalOpen(false);
      fetchBookings();
    } catch {
      message.error("Gagal resolve komplain");
    } finally {
      setResolveLoading(false);
    }
  };



  const fetchBookings = async () => {
  try {
    setLoading(true);
    const res = await fetch("http://localhost:8080/api/admin/bookings", {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error();
    const bookingsData: Booking[] = await res.json();

    // Fetch rating 
    const withRatings = await Promise.all(
      bookingsData.map(async (b) => {
        if (b.Status !== "done") return b;
        try {
          const rRes = await fetch(`http://localhost:8080/api/bookings/${b.ID}/rating`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (rRes.ok) {
            const rating = await rRes.json();
            return { ...b, Rating: rating };
          }
        } catch {}
        return b;
      })
    );

    setBookings(withRatings);
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
          on_progress:       { color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
          awaiting_approval: { color: "text-yellow-700",  bg: "bg-yellow-50",  border: "border-yellow-200" },
          complained:        { color: "text-red-700",     bg: "bg-red-50",     border: "border-red-300" },
          done:              { color: "text-green-700",   bg: "bg-green-50",   border: "border-green-200" },
        };
        const c = config[status] || config.pending;
        return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${c.color} ${c.bg} border ${c.border}`}>{status.toUpperCase()}</span>;
      },
    },
    {
      title: "Rating",
      render: (_: any, record: Booking) => {
        if (record.Status !== "done") return <span className="text-gray-300 text-sm">-</span>;
        if (!record.Rating) return <span className="text-gray-400 text-xs">Belum dirating</span>;
        return (
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setRatingPopup(record.Rating!)}
          >
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{ color: star <= record.Rating!.Stars ? "#f59e0b" : "#d1d5db", fontSize: 14 }}>★</span>
              ))}
            </div>
            {record.Rating.Comment && (
              <p className="text-xs text-gray-400 mt-0.5 max-w-[120px] truncate">"{record.Rating.Comment}"</p>
            )}
          </div>
        );
      }
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

          {record.Status === "complained" && (
            <Button
              size="small"
              className="!rounded-lg !text-xs !font-semibold"
              style={{ borderColor: "#f59e0b", color: "#f59e0b" }}
              onClick={() => {
                setResolveTargetId(record.ID);
                setResolveBooking(record);
                setResolveModalOpen(true);
              }}
            >
              Resolve
            </Button>
          )}

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
                { value: "on_progress", label: "On Progress" },      
                { value: "awaiting_approval", label: "Awaiting Approval" }, 
                { value: "complained", label: "Complained" },        
                { value: "done", label: "Done" },  
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

      <Modal
        title={<span className="font-bold text-gray-800">Resolve Komplain</span>}
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
        footer={null}
      >
        {resolveBooking && (
          <div className="space-y-4">

            {/* Info booking */}
            <div className="rounded-xl p-4 bg-gray-50 border border-gray-100 text-sm space-y-1">
              <p><span className="text-gray-500">User:</span> <span className="font-medium">{resolveBooking.User.email}</span></p>
              <p><span className="text-gray-500">Service:</span> <span className="font-medium">{resolveBooking.Service.Name}</span></p>
              <p><span className="text-gray-500">Cleaner:</span> <span className="font-medium">{resolveBooking.Cleaner?.username || "-"}</span></p>
            </div>

            {/* ── Foto dari cleaner ── */}
            {resolveBooking.CompletionImage ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Foto bukti dari cleaner:</p>
                <img
                  src={`http://localhost:8080${resolveBooking.CompletionImage}`}
                  alt="Bukti pekerjaan"
                  className="w-full rounded-xl object-cover max-h-56 border border-gray-100"
                />
              </div>
            ) : (
              <div className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-sm text-gray-400 text-center">
                Tidak ada foto dari cleaner
              </div>
            )}

            {/* ── Alasan komplain dari user ── */}
            {resolveBooking.ComplainNote && (
              <div className="rounded-xl p-4 bg-red-50 border border-red-100">
                <p className="text-xs font-semibold text-red-500 mb-1">Alasan komplain user:</p>
                <p className="text-sm text-red-700">{resolveBooking.ComplainNote}</p>
              </div>
            )}

            <p className="text-sm text-gray-500">Tinjau hasil kerja cleaner dan putuskan:</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleResolve("reject")}
                disabled={resolveLoading}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}
              >
                ✗ Tolak — Suruh Ulang
              </button>
              <button
                onClick={() => handleResolve("approve")}
                disabled={resolveLoading}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#2563eb", color: "white", border: "none" }}
              >
                ✓ Override Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
      title={<span className="font-bold text-gray-800">Detail Rating</span>}
      open={!!ratingPopup}
      onCancel={() => setRatingPopup(null)}
      footer={null}
      width={360}
    >
      {ratingPopup && (
        <div className="py-4 space-y-4 text-center">
        
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(star => (
              <span key={star} style={{ color: star <= ratingPopup.Stars ? "#f59e0b" : "#d1d5db", fontSize: 32 }}>★</span>
            ))}
          </div>

          {/* Label */}
          <p className="text-sm font-semibold text-gray-700">
            {["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"][ratingPopup.Stars]}
          </p>

          {/* Komentar */}
          {ratingPopup.Comment ? (
            <div className="rounded-xl p-4 bg-amber-50 border border-amber-100 text-left">
              <p className="text-xs font-semibold text-amber-600 mb-1">Komentar:</p>
              <p className="text-sm text-gray-700">{ratingPopup.Comment}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Tidak ada komentar</p>
          )}
        </div>
      )}
    </Modal>
    
    </div>
  );
}
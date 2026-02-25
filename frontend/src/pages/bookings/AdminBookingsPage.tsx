import { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message, Modal, Select, Popconfirm } from "antd";
import { useAuth } from "../../context/AuthContext";

type Booking = {
  ID: number;
  User: { id: number; email: string };
  Service: { ID: number; Name: string; Price: number };
  Date: string;
  Time: string;
  Address: string;
  Status: string;
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

  const { token } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch {
      message.error("Gagal ambil data booking admin");
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
      const data = await res.json();
      setCleaners(data);
    } catch {
      message.error("Gagal ambil data cleaner");
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchCleaners(); 
    }
  }, [token]);

  
  const openApproveModal = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setSelectedCleanerId(null); 
    setApproveModalOpen(true);
  };

  // Confirm approve 
  const handleApproveConfirm = async () => {
    if (!selectedCleanerId) {
      message.warning("Pilih cleaner terlebih dahulu");
      return;
    }

    try {
      setApproveLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/admin/bookings/${selectedBookingId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cleaner_id: selectedCleanerId }),
        }
      );

      if (!res.ok) throw new Error();

      message.success("Booking approved");
      setApproveModalOpen(false);
      fetchBookings(); 
    } catch {
      message.error("Gagal approve booking");
    } finally {
      setApproveLoading(false);
    }
  };

  // Reject booking
  const handleReject = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/bookings/${id}/reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error();
      message.success("Booking rejected");
      fetchBookings();
    } catch {
      message.error("Gagal reject booking");
    }
  };

  const columns = [
    {
      title: "User",
      dataIndex: ["User", "email"],
    },
    {
      title: "Service",
      dataIndex: ["Service", "Name"],
    },
    {
      title: "Date",
      dataIndex: "Date",
    },
    {
      title: "Time",
      dataIndex: "Time",
    },
    {
      title: "Address",
      dataIndex: "Address",
    },
    {
      title: "Cleaner",
      render: (_: any, record: Booking) =>
        record.Cleaner ? record.Cleaner.username : "-",
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (status: string) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "rejected"
              ? "red"
              : "orange"
          }
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            type="primary"
            onClick={() => openApproveModal(record.ID)}
            disabled={record.Status !== "pending"}
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
                <Button
                  danger
                  disabled={record.Status !== "pending"}
                >
                  Reject
                </Button>
      </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Booking Management</h2>

      <Table
        rowKey="ID"
        columns={columns}
        dataSource={bookings}
        loading={loading}
      />

      <Modal
        title="Pilih Cleaner"
        open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)}
        onOk={handleApproveConfirm}
        okText="Approve"
        cancelText="Batal"
        confirmLoading={approveLoading}
      >
        <p className="mb-3">Pilih cleaner yang akan ditugaskan untuk booking ini:</p>
        <Select
          placeholder="Pilih cleaner..."
          style={{ width: "100%" }}
          onChange={(val) => setSelectedCleanerId(val)}
          value={selectedCleanerId}
          options={cleaners.map((c) => ({
            value: c.id,
            label: `${c.username} (${c.email})`,
          }))}
        />
      </Modal>
    </div>
  );
}
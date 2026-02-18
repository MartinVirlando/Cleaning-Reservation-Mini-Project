import { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message } from "antd";
import { useAuth } from "../../context/AuthContext";

type Booking = {
  id: number;
  user: {
    id: number;
    email: string;
  };
  service: {
    id: number;
    name: string;
    price: number;
  };
  date: string;
  time: string;
  address: string;
  status: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

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
      console.log("UPDATE RESULT:", data);

    } catch (err) {
      message.error("Gagal ambil data booking admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token){
        fetchBookings();
    }    
  }, [token]);

  const updateStatus = async (id: number, action: "approve" | "reject") => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/bookings/${id}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Update gagal");

      message.success(`Booking ${action} berhasil`);
      fetchBookings();
    } catch {
      message.error("Update status gagal");
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
      title: "Status",
      dataIndex: "Status",
      render: (status: string) => {
        const color =
          status === "approved"
            ? "green"
            : status === "rejected"
            ? "red"
            : "orange";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() => updateStatus(record.ID, "approve")}
            disabled={record.Status !== "pending"}
          >
            Approve
          </Button>

          <Button
            danger
            onClick={() => updateStatus(record.ID, "reject")}
            disabled={record.Status !== "pending"}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Booking Management</h2>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={bookings}
        loading={loading}
      />
    </div>
  );
}

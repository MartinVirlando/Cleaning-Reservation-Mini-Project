import { useEffect, useState } from "react";
import { Card, Tag, Spin, Alert, Empty } from "antd";
import { useAuth } from "../../context/AuthContext";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from "@ant-design/icons";
import  dayjs  from "dayjs";

type ScheduleBooking = {
  ID: number;
  Date: string;
  Time: string;
  Address: string;
  Status: string;
  User: { Username: string; Email: string };
  Service: { Name: string };
};

export default function CleanerSchedulePage() {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/cleaner/schedule", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSchedule(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [token]);

  if (loading) return <div className="flex justify-center py-10"><Spin size="large" /></div>;
  if (error) return <Alert type="error" message="Failed to load schedule" />;
  if (schedule.length === 0) return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-6">My Schedule</h1>
      <Empty description="No assignments yet" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-green-900 mb-6">
        My Schedule
        <span className="text-gray-400 ml-2 text-lg font-normal">
          ({schedule.length} assignment{schedule.length > 1 ? "s" : ""})
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((booking) => {
          // Cek apakah tanggal booking sudah lewat
          const isPast = dayjs(booking.Date).isBefore(dayjs(), "day");
          const isToday = dayjs(booking.Date).isSame(dayjs(), "day");

          return (
            <Card
              key={booking.ID}
              hoverable
              // Ubah warna card berdasarkan status tanggal
              className={`shadow-md transition-all ${
                isPast
                  ? "opacity-60 bg-gray-50"   
                  : isToday
                  ? "border-2 border-green-400 bg-green-50"  
                  : "bg-white"  
              }`}
              title={
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-800">
                    {booking.Service?.Name || "Unknown Service"}
                  </span>
                  <div className="flex gap-2">
                    {isToday && (
                      <Tag color="green">TODAY</Tag>
                    )}
                    {isPast && (
                      <Tag color="default">DONE</Tag>
                    )}
                    {!isPast && !isToday && (
                      <Tag color="blue">UPCOMING</Tag>
                    )}
                  </div>
                </div>
              }
            >
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <UserOutlined className="text-gray-400" />
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium">{booking.User?.Email || "-"}</span>
                </p>

                <p className="flex items-center gap-2">
                  <CalendarOutlined className="text-gray-400" />
                  <span className="text-gray-500">Date:</span>
                  <span className={`font-medium ${isToday ? "text-green-600" : isPast ? "text-gray-400" : ""}`}>
                    {booking.Date}
                  </span>
                </p>

                <p className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-gray-400" />
                  <span className="text-gray-500">Time:</span>
                  <span className="font-medium">{booking.Time}</span>
                </p>

                <p className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-gray-400" />
                  <span className="text-gray-500">Address:</span>
                  <span className="font-medium">{booking.Address}</span>
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
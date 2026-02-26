import { useState } from "react";
import { Card, Spin, Alert, Empty, Tag, Calendar, Badge, message, Popconfirm } from "antd";
import { useBookingsQuery } from "../../services/queries/useBookingsQuery";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/atoms/Buttons";
import { WarningOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useAuth } from "../../context/AuthContext";
import { createSnapToken } from "../../services/paymentService";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function BookingsPage() {
  const { data, isLoading, isError } = useBookingsQuery();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  // Buat Handle pay
  const handlePay = async (bookingId: number) => {
    try{
      setPayingId(bookingId);
      const snapToken = await createSnapToken(bookingId);
      window.snap.pay(snapToken, {
        onSuccess: () => {
          message.success("Payment Success");
          window.location.reload();
        },
        onPending: () => {
          message.info("Waiting for payment...");
          window.location.reload();
        },
        onError: () => {
          message.error("Payment Failed");
        },
        onClose: () => {
          message.warning("Popup closed before payment");
        },

      });
    }catch{
      message.error("Gagal melakukan pembayaran");
    } finally{
        setPayingId(null);
    }
  };

  // Buat Cancel Booking
  const handleCancel = async (bookingId: number) => {
    try {
      setCancellingId(bookingId);
      const res = await fetch(
        `http://localhost:8080/api/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();
      message.success("Booking canceled!");
      window.location.reload();
    } catch {
      message.error("Gagal cancel booking");
    } finally {
      setCancellingId(null);
    }
  };


  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert type="error" message="Failed to load bookings" />;
  }

  if (data.length === 0) {
    return (
      <div className="pt-2">
        <Button onClick={() => navigate(-1)}>Back</Button>
        <Empty description="No bookings yet" className="mt-8" />
      </div>
    );
  }

  // Function: Get bookings for a specific date
  const getBookingsForDate = (date: Dayjs) => {
    return data.filter((booking) => {
      const bookingDate = dayjs(booking.date);
      return bookingDate.isSame(date, "day");
    });
  };

  // Render Calender
  const dateCellRender = (value: Dayjs) => {
    const dayBookings = getBookingsForDate(value);

    if (dayBookings.length === 0) return null;

    return (
      <ul className="events list-none p-0 m-0">
        {dayBookings.map((booking) => (
          <li key={booking.id} className="mb-1">
            <Badge
              status={
                booking.status === "approved"
                  ? "success"
                  : booking.status === "rejected"
                  ? "error"
                  : "warning"
              }
              text={
                <span className="text-xs truncate">
                  {booking.service?.name || "Unknown"}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  // Function: Handle date selection
  const onSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    
    // Scroll to first booking of selected date
    const dateBookings = getBookingsForDate(date);
    if (dateBookings.length > 0) {
      const firstBookingId = `booking-${dateBookings[0].id}`;
      const element = document.getElementById(firstBookingId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const displayedBookings = (selectedDate ? getBookingsForDate(selectedDate) : data)
    .slice()
    .sort((a, b) => {
      const aIsPast = dayjs(`${a.date} ${a.time}`).isBefore(dayjs());
      const bIsPast = dayjs(`${b.date} ${b.time}`).isBefore(dayjs());
      if (aIsPast === bIsPast) return 0;
      return aIsPast ? 1 : -1;
    });

  return (
    <div className="pt-2 max-w-7xl mx-auto text-blue-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Button onClick={() => navigate("/services")}>Back</Button>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Booking Calendar</h2>
          {selectedDate && (
            <Button
              onClick={() => setSelectedDate(null)}
              type="default"
              size="small"
            >
              Show All Bookings
            </Button>
          )}
        </div>

        <Calendar
          cellRender={dateCellRender}
          onSelect={onSelectDate}
          className="custom-calendar"
        />

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge status="success" />
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status="warning" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status="error" />
            <span>Rejected</span>
          </div>
        </div>
      </div>

      {/* Booking Cards Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {selectedDate
            ? `Bookings on ${selectedDate.format("MMMM D, YYYY")}`
            : "All Bookings"}
          <span className="text-gray-400 ml-2">
            ({displayedBookings.length})
          </span>
        </h2>

        {displayedBookings.length === 0 ? (
          <Empty description="No bookings on this date" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedBookings.map((booking) => {
              const isPast = dayjs(`${booking.date} ${booking.time}`).isBefore(dayjs());
              const isToday = dayjs(booking.date).isSame(dayjs(), "day") && !isPast;

              return (
                <Card
                  key={booking.id}
                  id={`booking-${booking.id}`}
                  hoverable
                  className={`shadow-md hover:shadow-xl transition-shadow duration-300 ${
                              selectedDate && dayjs(booking.date).isSame(selectedDate, "day")
                              ? "ring-2 ring-blue-400": ""} 
                              ${isPast ? "opacity-60 bg-gray-50" : isToday ? "border-2 border-blue-400 bg-blue-50" : "bg-white"}`}
                  title={
                    <div className="flex justify-between items-center">
                      <span className="font-bold">
                        Booking #{data.indexOf(booking) + 1}
                      </span>
                      <div className="flex gap-2">
                        {isToday && <Tag color="blue">Today</Tag>}
                        {isPast && <Tag color="default">Done</Tag>}
                        <Tag
                            color={
                              booking.status === "approved"
                                ? "green"
                                : booking.status === "rejected"
                                ? "red"
                                : "orange"
                            }
                          >
                            {booking.status.toUpperCase()}
                          </Tag>
                      </div>
                      
                    </div>
                  }
                >
                  {/* Service Name */}
                  <div className="mb-4 pb-3 border-b border-gray-200">
                    {(booking.service as any)?.isDeleted ? (
                      <div>
                        <p className="text-lg font-semibold text-gray-400 line-through">
                          {booking.service?.name ?? "Unknown Service"}
                        </p>
                        <Tag
                          icon={<WarningOutlined />}
                          color="warning"
                          className="mt-2"
                        >
                          Service No Longer Available
                        </Tag>
                      </div>
                    ) : (
                      <p className="text-lg font-semibold text-blue-600">
                        {booking.service?.name ?? "-"}
                      </p>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium">{booking.date}</span>
                    </p>

                    <p className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium">{booking.time}</span>
                    </p>

                    <p className="flex justify-between">
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {booking.address}
                      </span>
                    </p>

                    {booking.status === "approved" && booking.cleaner && (
                      <p className="flex justify-between mt-2 pt-2 bortder-t border-gray-100">
                        <span className="text-gray-500">Cleaner:</span>
                        <span className="font medium text-green-600">
                          {booking.cleaner.name}
                        </span>
                      </p>
                    )}

                  </div>

                  {/* Hanya tampil jika status pending */}
                  {booking.status === "pending" && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      {/* Cancel Booking */}
                      <Popconfirm
                        title="Cancel booking ini?"
                        description="Tindakan ini tidak bisa dibatalkan"
                        onConfirm={() => handleCancel(booking.id)}
                        okText="Ya, Cancel"
                        cancelText="Tidak"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          danger
                          size="small"
                          loading={cancellingId === booking.id}
                          className="w-full"
                        >
                          Cancel Booking
                        </Button>
                      </Popconfirm>
                    </div>
                  )}

                  {/* Pembayaran */}
                  {(booking.paymentStatus === "unpaid" || !booking.paymentStatus) &&
                    booking.status !== "rejected" &&
                    booking.status !== "canceled" &&
                    booking.status !== "approved" && (
                      <div className="mt-3">
                        <Button
                          type="primary"
                          size="small"
                          loading={payingId === booking.id}
                          onClick={() => handlePay(booking.id)}
                          className="w-full"
                          style={{backgroundColor: "#16a34a", borderColor: "#16a34a"}}>
                          
                        Bayar Sekarang
                        </Button>
                      </div>
                    )}

                    {booking.paymentStatus === "paid" && (
                      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                          <Tag color="green">Lunas</Tag>
                      </div>
                    )}

                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
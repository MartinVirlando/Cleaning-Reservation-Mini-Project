import { useState } from "react";
import { Card, Spin, Alert, Empty, Tag, Calendar, Badge } from "antd";
import { useBookingsQuery } from "../../services/queries/useBookingsQuery";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/atoms/Buttons";
import { WarningOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function BookingsPage() {
  const { data, isLoading, isError } = useBookingsQuery();
  const navigate = useNavigate();
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

  // Function: Render calendar cell with booking badges
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

  // Filter bookings: show selected date or all
  const displayedBookings = selectedDate
    ? getBookingsForDate(selectedDate)
    : data;

  return (
    <div className="pt-2 max-w-7xl mx-auto text-blue-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Button onClick={() => navigate(-1)}>Back</Button>
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
            {displayedBookings.map((booking) => (
              <Card
                key={booking.id}
                id={`booking-${booking.id}`}
                hoverable
                className={`shadow-md hover:shadow-xl transition-shadow duration-300 ${
                  selectedDate &&
                  dayjs(booking.date).isSame(selectedDate, "day")
                    ? "ring-2 ring-blue-400"
                    : ""
                }`}
                title={
                  <div className="flex justify-between items-center">
                    <span className="font-bold">
                      Booking #{data.indexOf(booking) + 1}
                    </span>
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
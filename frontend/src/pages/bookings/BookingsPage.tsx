import { Card, Spin, Alert, Empty, Tag } from "antd";
import { useBookingsQuery } from "../../services/queries/useBookingsQuery";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/atoms/Buttons";


export default function BookingsPage() {
  const { data, isLoading, isError } = useBookingsQuery();
  const navigate = useNavigate();

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
    return <div>
      <Button onClick={() => navigate(-1)}>Back</Button>
      <Empty description="No bookings yet" className="mt-8" />
    </div>;
  }

  return (
    <div className="pt-2 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((booking, index) => (
          <Card
            key={booking.id}
            hoverable
            className="shadow-md hover:shadow-xl transition-shadow duration-300"
            title={
              <div className="flex justify-between items-center">
                <span className="font-bold">Booking #{index + 1}</span>
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
            
            <div className="mb-4 pb-3 border-b border-gray-200">
              <p className="text-lg font-semibold text-blue-600">
                {booking.service?.name ?? "-"}
              </p>
            </div>

            
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
    </div>
  );
}

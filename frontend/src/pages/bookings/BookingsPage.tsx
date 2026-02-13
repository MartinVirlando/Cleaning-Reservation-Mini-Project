import { Card, Spin, Alert, Empty } from "antd";
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
      <Empty description="No bookings yet" />
    </div>;
  }

  return (
    <div className="pt-2 max-w-3xl">
      
      <h1 className="text-xl font-bold mb-4">My Bookings</h1>
        <Button onClick={() => navigate(-1)}>Back</Button>
      <div className="space-y-4">
        
        {data.map((booking, index) => (
          <Card key={booking.id} title={`Booking #${index + 1}`}>
            <p>
              <b>Service:</b> {booking.service?.name ?? "-"}
            </p>

            <p>
              <b>Status:</b> {booking.status}
            </p>

            <p>
              <b>Date:</b> {booking.date}
            </p>

            <p>
              <b>Time:</b> {booking.time}
            </p>

            <p>
              <b>Address:</b> {booking.address}
            </p>
            
          </Card>
        ))}
      </div>
    </div>
  );
}

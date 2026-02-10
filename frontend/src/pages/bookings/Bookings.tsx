import { Card, Spin, Alert, Tag, Empty, Button } from "antd";
import { useBookingsQuery } from "../../services/queries/useBookingsQuery";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
    const { data, isLoading, isError } = useBookingsQuery();
    const navigate = useNavigate();

  if (isLoading) {
        return (
        <div className="flex justify-center py-10">
            <Spin size="large" />
        </div>
    );
  }

  if (isError) {
  return (
    <Alert
      type="error"
      message="Session expired"
      description="Please login again"
      action={
        <Button size="small" onClick={() => navigate("/login")}>
          Login
        </Button>
      }
    />
  );
}


  if (!data || data.bookings.length === 0) {
        return (
        <div>
            <Button onClick={() => navigate("/services")}>Back</Button>
            <Card title="My Bookings">
                <Empty description="No bookings yet" />
            </Card>
        </div>
        
        
    );
  }

  return (
    <div className="space-y-4">
        
        <h1 className="text-xl font-semibold">My Bookings</h1>
        
        <Button onClick={() => navigate("/services")}>Back</Button>
        {data.bookings.map((b) => (
            <Card key={b.id} >
                <div className="space-y-2">
                    <p>
                        <b>Date:</b> {b.date}
                    </p>
                    <p>
                        <b>Time:</b> {b.time}
                    </p>
                    <p>
                        <b>Address:</b> {b.address}
                    </p> 
                    {b.notes && (
                        <p>
                            <b>Notes:</b> {b.notes}
                        </p>
                    )}

                    <div>
                        <b>Status:</b>{" "}
                        <Tag>
                            {b.status}
                        </Tag>
                    </div>

                    <p className="text-xs text-gray-500">Booking ID: {b.id}</p>
                </div>
            </Card>
        ))}

    </div>
  );
}
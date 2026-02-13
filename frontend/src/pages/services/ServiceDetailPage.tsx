import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Alert,
  Button,
  Form,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import { useServiceDetailQuery } from "../../services/queries/useServiceDetailQuery";
import { createBooking } from "../../services/bookingService";
import type { AxiosError } from "axios";
import Input from "../../components/atoms/Input";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data, isLoading, isError } = useServiceDetailQuery(id || "");

  async function handleBooking(values: any) {
    try {
      await createBooking({
        serviceId: Number(id),
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm"),
        address: values.address,
      });

      message.success("Booking created!");
      navigate("/bookings");
    } catch (err: any) {
  
      const axiosErr = err as AxiosError<any>;

      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.message ||
        "Failed to create booking";

      message.error(msg);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert type="error" message="Service not found" />;
  }

  return (
    <div className="pt-2 max-w-xl mx-auto">
      <Button onClick={() => navigate(`/services`)}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" >
        Back
      </Button>
      <Card title={data.name}>
        <p>{data.description}</p>

        <p className="mt-2">
          <b>Price:</b> Rp {data.price.toLocaleString("id-ID")}
        </p>

        <p>
          <b>Duration:</b> {data.durationMinutes} minutes
        </p>

        <div className="mt-6">
          <h2 className="font-bold mb-2">Book this service</h2>

          <Form form={form} layout="vertical" onFinish={handleBooking}>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              label="Time"
              name="time"
              rules={[{ required: true, message: "Please select time" }]}
            >
              <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input placeholder="Your Address" className="w-full"/>
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Create Booking
            </Button>

            
          </Form>
        </div>
      </Card>
    </div>
  );
}

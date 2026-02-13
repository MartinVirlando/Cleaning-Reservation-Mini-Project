import { Card, Form, DatePicker, TimePicker, Input, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useServiceDetailQuery } from "../../services/queries/useServiceDetailQuery";
import { useCreateBookingMutation } from "../../services/queries/useCreateBookingMutation";

type BookingFormValues = {
    date: dayjs.Dayjs;
    time: dayjs.Dayjs;
    address: string;
}

export default function BookingCreate() { 
    const {id} = useParams();
    const navigate = useNavigate();

    if(!id) {
        return <div>Service not Available</div>
    }

    const { data: service, isLoading } = useServiceDetailQuery(id);
    const createBookingMutation = useCreateBookingMutation();

    const onFinish = (values: BookingFormValues) => {
        const payload ={
            serviceId: Number(id),
            date: values.date.format("YYYY-MM-DD"),
            time: values.time.format("HH:mm"),
            address: values.address,
        };

        createBookingMutation.mutate(payload, {
            onSuccess: () => {
                message.success("Booking created successfully!");
                navigate("/Bookings");
            },

            onError: (err) => {              
                message.error(err.message || "Failed to Create Booking");
            },

        });

    };

    return (
        <div className="max-w-2x1 space-y-4">
            <Button onClick={() => navigate(`/Services/`)}>Back</Button>

            <Card title= "Create Booking" loading={isLoading}>
                {service && (
                    <div className="mb-4">
                        <p className="front-semibold">{service.name}</p>
                        <p className="text-gray-600">{service.description}</p>
                        <p className="text-sm mt-2">
                            <b>Price</b> Rp {service.price.toLocaleString("id-ID")} | {" "}
                            <b>Duration</b> {service.durationMinutes} minutes
                        </p>
                    </div>
                )}

                <Form layout="vertical" onFinish={onFinish}>

                    <Form.Item
                    label="Booking Date"
                    name="date"
                    rules={[{ required: true, message: "Please pick a booking date" }]}>
                        <DatePicker className="w-full"/>
                    </Form.Item>

                    <Form.Item
                    label="Booking Time"
                    name="time"
                    rules={[{ required: true, message: "Please pick a booking time"}]}>
                        <TimePicker className="w-full" format="HH:mm"/>
                    </Form.Item>

                    <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: "Please enter your address"}]}>
                        <Input placeholder="Your Address"/>
                    </Form.Item>

                    <Form.Item label="Notes (Optional)" name="notes">
                        <Input.TextArea rows={3} placeholder="Extra notes..." />
                    </Form.Item>

                    <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full"
                    loading={createBookingMutation.isPending}>
                        Confirm Booking
                    </Button>

                </Form>
            </Card>
        </div>
    );
}
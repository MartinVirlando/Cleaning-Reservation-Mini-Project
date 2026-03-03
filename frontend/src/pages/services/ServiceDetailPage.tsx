import { useParams, useNavigate } from "react-router-dom";
import { Alert, Form, DatePicker, TimePicker, message } from "antd";
import { useServiceDetailQuery } from "../../services/queries/useServiceDetailQuery";
import { createBooking } from "../../services/bookingService";
import dayjs from "dayjs";
import type { AxiosError } from "axios";
import Input from "../../components/atoms/Input";
import { useEffect, useRef } from "react";

function getServiceIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("premium") || n.includes("deep")) return "✦";
  if (n.includes("basic") || n.includes("regular")) return "◈";
  if (n.includes("kandang") || n.includes("animal")) return "⬡";
  if (n.includes("office") || n.includes("kantor")) return "▣";
  if (n.includes("window") || n.includes("kaca")) return "◇";
  if (n.includes("carpet") || n.includes("karpet")) return "⬟";
  return "◉";
}

const disabledDate = (current: dayjs.Dayjs) => {
  if (!current) return false;
  const day = current.day(); 
  const isSunday = day === 0;
  const isPastOrToday = current.isBefore(dayjs().add(1, "day"), "day");
  return isSunday || isPastOrToday;
};

const disabledTime = () => ({
  disabledHours: () => {
    const hours = [];
    for (let i = 0; i < 8; i++) hours.push(i);  
    for (let i = 17; i < 24; i++) hours.push(i);  
    return hours;
  },
  disabledMinutes: (hour: number) => {
    
    if (hour === 17) return Array.from({ length: 60 }, (_, i) => i + 1);
    return [];
  },
});

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const pageRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useServiceDetailQuery(id || "");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

      .detail-page { font-family: 'DM Sans', sans-serif; }
      .detail-title { font-family: 'Syne', sans-serif; }

      .detail-page-bg {
        background-color: #f0f4ff;
        background-image:
          linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      .detail-card {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1);
      }
      .detail-card.visible { opacity: 1; transform: translateY(0); }

      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #3b82f6;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'DM Sans', sans-serif;
        margin-bottom: 24px;
      }
      .back-btn:hover {
        background: #1e3a5f;
        color: white;
        border-color: #1e3a5f;
        transform: translateX(-3px);
      }

      .detail-form .ant-form-item-label > label {
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: rgba(255,255,255,0.7) !important;
        letter-spacing: 0.02em;
      }
      .detail-form .ant-picker {
        background: rgba(255,255,255,0.07) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        border-radius: 10px !important;
        width: 100%;
        color: white !important;
      }
      .detail-form .ant-picker:hover,
      .detail-form .ant-picker-focused {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59,130,246,0.15) !important;
      }
      .detail-form .ant-picker input {
        color: white !important;
        font-family: 'DM Sans', sans-serif !important;
      }
      .detail-form .ant-picker-suffix,
      .detail-form .ant-picker-separator { color: rgba(255,255,255,0.3) !important; }
      .detail-form .ant-form-item-explain-error {
        font-size: 12px;
        font-family: 'DM Sans', sans-serif;
      }

      .submit-btn {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        font-family: 'Syne', sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.04em;
        border: none;
        cursor: pointer;
        transition: all 0.25s ease;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
      }
      .submit-btn:hover {
        background: linear-gradient(135deg, #60a5fa, #2563eb);
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(59,130,246,0.35);
      }
      .submit-btn:active { transform: translateY(0); }

      .detail-input {
        background: rgba(255,255,255,0.07) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        border-radius: 10px !important;
        color: white !important;
        font-family: 'DM Sans', sans-serif !important;
        padding: 10px 14px !important;
        transition: all 0.2s ease !important;
      }
      .detail-input:hover, .detail-input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59,130,246,0.15) !important;
        background: rgba(255,255,255,0.10) !important;
      }
      .detail-input::placeholder { color: rgba(255,255,255,0.25) !important; }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      pageRef.current?.querySelectorAll(".detail-card").forEach((el, i) => {
        setTimeout(() => el.classList.add("visible"), i * 100);
      });
    }, 50);

    return () => { document.head.removeChild(style); };
  }, [data]);

  if (isLoading) {
    return (
      <div className="detail-page detail-page-bg flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-blue-400 text-sm font-medium">Loading service...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) return <Alert type="error" message="Service not found" />;

  const icon = getServiceIcon(data.name);

  return (
    <div className="detail-page detail-page-bg min-h-screen" ref={pageRef}>
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-16">

        <button className="back-btn" onClick={() => navigate("/services")}>
          ← Back to Services
        </button>

        <div className="flex items-center gap-2 mb-5 detail-card">
          <div className="w-6 h-px bg-blue-500" />
          <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
            Service Detail
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Service Info */}
          <div className="lg:col-span-2 detail-card">
            <div
              className="rounded-2xl p-7 h-full flex flex-col"
              style={{ background: "#0f172a", boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 select-none"
                style={{
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  color: "#60a5fa",
                  fontFamily: "monospace",
                }}
              >
                {icon}
              </div>

              <h1 className="detail-title text-2xl font-bold text-white leading-snug mb-3">
                {data.name}
              </h1>

              <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
                {data.description || "Professional cleaning service by trained experts."}
              </p>

              <div className="mb-6" style={{ height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.4), transparent)" }} />

              <div className="space-y-4 mt-auto">
                {[
                  { label: "Duration", value: `${data.durationMinutes} minutes` },
                  { label: "Price", value: `Rp ${data.price.toLocaleString("id-ID")}` },
                  { label: "Confirmation", value: "Instant" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="detail-title text-sm font-bold text-blue-400">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="mt-8 rounded-xl p-4 flex items-start gap-3"
                style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
              >
                <span className="text-blue-400 text-lg mt-0.5">ℹ</span>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Fill in the booking form and our team will confirm your schedule shortly.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-3 detail-card">
            <div
              className="rounded-2xl p-7"
              style={{ background: "#1e3a5f", boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)" }}
            >
              <div className="mb-7">
                <h2 className="detail-title text-xl font-bold text-white mb-1">
                  Book this Service
                </h2>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Fill in your preferred schedule and address below
                </p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={async (values) => {
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
                    message.error(
                      axiosErr?.response?.data?.message ||
                      axiosErr?.message ||
                      "Failed to create booking"
                    );
                  }
                }}
                className="detail-form"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <Form.Item
                    label="Date"
                    name="date"
                    rules={[{ required: true, message: "Please select date" }]}
                  >
                    <DatePicker 
                      className="w-full" 
                      style={{ height: 44 }}
                      disabledDate={disabledDate} />
                  </Form.Item>

                  <Form.Item
                    label="Time"
                    name="time"
                    rules={[{ required: true, message: "Please select time" }]}
                  >
                    <TimePicker 
                      className="w-full" 
                      format="HH:mm" 
                      style={{ height: 44 }}
                      disabledTime={disabledTime}
                      hideDisabledOptions
                      minuteStep={30} />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <Input
                    placeholder="Enter your full address..."
                    className="detail-input w-full"
                  />
                </Form.Item>

                <div
                  className="rounded-xl p-4 mb-6"
                  style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-xs font-semibold mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                    ORDER SUMMARY
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{data.name}</span>
                    <span className="detail-title text-sm font-bold text-blue-400">
                      Rp {data.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="my-3" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Total</span>
                    <span className="detail-title text-base font-bold text-white">
                      Rp {data.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  Confirm Booking →
                </button>
              </Form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
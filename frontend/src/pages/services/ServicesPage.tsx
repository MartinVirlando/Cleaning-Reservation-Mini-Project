import { Card, List, Spin, Alert, Tag, Empty } from "antd";
import { useServicesQuery } from "../../services/queries/useServicesQuery";
import { useNavigate } from "react-router-dom";
import { ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";

export default function ServicesPage() {
  const { data, isLoading, isError } = useServicesQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert type="error" message="Failed to load services." />;
  }

   if (data.length === 0) {
    return <Empty description="No services available" className="mt-20" />;
  }


  return (
    <div className="pt-2 max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Our Services</h1>
        <p className="text-gray-500 mt-2">Choose the perfect cleaning service for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((service) => (
          <Card
            key={service.id}
            hoverable
            className="shadow-md hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden border-0"
            onClick={() => navigate(`/services/${service.id}`)}
          >
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 -mt-6 -mx-6 px-6 py-4 mb-4">
              <h3 className="text-xl font-bold text-white">{service.name}</h3>
            </div>

           
            <p className="text-gray-600 min-h-[3rem] mb-4 line-clamp-2">
              {service.description}
            </p>

            
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarOutlined className="text-green-600" />
                  <span className="text-sm font-medium">Price</span>
                </div>
                <Tag color="green" className="text-base px-3 py-1">
                  Rp {service.price.toLocaleString("id-ID")}
                </Tag>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockCircleOutlined className="text-blue-600" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <Tag color="blue" className="text-base px-3 py-1">
                  {service.durationMinutes} min
                </Tag>
              </div>
            </div>

            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400 hover:text-blue-500 transition-colors">
                Click to book this service →
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

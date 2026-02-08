import { Card, List, Spin, Alert } from "antd";
import { useServicesQuery } from "../../services/queries/useServicesQuery";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const { data, isLoading, isError } = useServicesQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert type="error" message="Failed to load services." />;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Services</h1>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={data}
        renderItem={(service) => (
          <List.Item>
            <Card
              hoverable
              title={service.name}
              onClick={() => navigate(`/services/${service.id}`)}
            >
              <p className="text-gray-600">{service.description}</p>

              <div className="mt-4 text-sm">
                <p>
                  <b>Price:</b> Rp {service.price.toLocaleString("id-ID")}
                </p>
                <p>
                  <b>Duration:</b> {service.durationMinutes} minutes
                </p>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

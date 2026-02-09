import { Card, Spin, Alert, Descriptions, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useServiceDetailQuery } from "../../services/queries/useServiceDetailQuery";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Alert type="error" message="Service ID not found in URL" />;
  }

  const { data, isLoading, isError } = useServiceDetailQuery(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert type="error" message="Failed to load service detail" />;
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => navigate("/services")}>Back</Button>

      <Card title={data.name}>
        <p className="text-gray-600">{data.description}</p>

        <div className="mt-6">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Price">
              Rp {data.price.toLocaleString("id-ID")}
            </Descriptions.Item>

            <Descriptions.Item label="Duration">
              {data.durationMinutes} minutes
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
      <Button
      type="primary"
      className="w-full mt-4"
      onClick={() => navigate(`/services/${id}/book`)}>
        Book Now
      </Button>

    </div>
    
  );
}

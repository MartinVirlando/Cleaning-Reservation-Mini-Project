import api from "../lib/api";

export type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
};

export async function getServices(): Promise<Service[]> {
  const res = await api.get("/api/services");

  return res.data.map((s: any) => ({
    id: s.ID,
    name: s.Name,
    description: s.Description ?? "",
    price: s.Price,
    durationMinutes: s.Duration,
  }));
}


export async function getServiceById(id: string): Promise<Service> {
  const res = await api.get(`/api/services/${id}`);
  const s = res.data;

  return {
    id: s.ID,
    name: s.Name,
    description: s.Description ?? "",
    price: s.Price,
    durationMinutes: s.Duration,
  };
}


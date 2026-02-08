export type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
};

const fakeServices: Service[] = [
  {
    id: 1,
    name: "Basic Cleaning",
    description: "Cleaning yang b aja",
    price: 75000,
    durationMinutes: 60,
  },
  {
    id: 2,
    name: "Advance Cleaning",
    description: "Cleaning luar dalam",
    price: 85000,
    durationMinutes: 70,
  },
  {
    id: 3,
    name: "Deep Cleaning",
    description: "Cleaning luar dalam atas bawah kiri kanan",
    price: 105000,
    durationMinutes: 100,
  },
];

export async function getServices(): Promise<Service[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fakeServices), 500);
  });
}

export async function getServiceById(id: string): Promise<Service> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const service = fakeServices.find((s) => s.id === Number(id));

      if (!service) {
        reject(new Error("Service not found"));
        return;
      }

      resolve(service);
    }, 500);
  });
}

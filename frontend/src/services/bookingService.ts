import api from "../lib/api";

export type Booking = {
  id: number;
  userId: number;
  serviceId: number;
  date: string;
  time: string;
  status: string;
  address?: string;

  service?: {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
    isDeleted?: boolean;
  };
};


type BookingApi = {
  ID: number;
  UserID: number;
  ServiceID: number;
  Date: string;
  Time: string;
  Status: string;
  Address?: string;

  Service?: {
    ID: number;
    Name: string;
    Price: number;
    Duration: number;
    DeletedAt?: string | null;
  };
};

function mapBooking(b: BookingApi): Booking {
  return {
    id: b.ID,
    userId: b.UserID,
    serviceId: b.ServiceID,
    date: b.Date,
    time: b.Time,
    status: b.Status,
    address: b.Address,

    service: b.Service
      ? {
          id: b.Service.ID,
          name: b.Service.Name,
          price: b.Service.Price,
          durationMinutes: b.Service.Duration,
          isDeleted: !!b.Service.DeletedAt,
        }
      : undefined,
  };
}


export type CreateBookingRequest = {
  serviceId: number;
  date: string; 
  time: string;   
  address: string;
};

export async function createBooking(payload: CreateBookingRequest) {
  const res = await api.post("/api/bookings", payload);
  return res.data;
}


export async function getMyBookings(): Promise<Booking[]> {
  const res = await api.get("/api/bookings");


  return (res.data as BookingApi[]).map(mapBooking);
}

import api from "../lib/api";

export type Booking = {
  id: number;
  userId: number;
  serviceId: number;
  date: string;
  time: string;
  status: string;
  address?: string;
  paymentStatus: string;
  snapToken?: string;
  completionImage?: string;


  service?: {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
    isDeleted?: boolean;
  };

  cleaner?: {
    id: number;
    name: string;
  }
};


type BookingApi = {
  ID: number;
  UserID: number;
  ServiceID: number;
  Date: string;
  Time: string;
  Status: string;
  Address?: string;
  PaymentStatus?: string;
  SnapToken?: string;
  CompletionImage?: string;



  Service?: {
    ID: number;
    Name: string;
    Price: number;
    Duration: number;
    DeletedAt?: string | null;
  };

  Cleaner?: {
    id: number;
    username: string;
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
    paymentStatus: b.PaymentStatus ?? "unpaid",
    snapToken: b.SnapToken,
    completionImage: b.CompletionImage,


    service: b.Service
      ? {
          id: b.Service.ID,
          name: b.Service.Name,
          price: b.Service.Price,
          durationMinutes: b.Service.Duration,
          isDeleted: !!b.Service.DeletedAt,
        } : undefined,

    cleaner: b.Cleaner
      ? {
          id: b.Cleaner.id,
          name: b.Cleaner.username,
        } : undefined,
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

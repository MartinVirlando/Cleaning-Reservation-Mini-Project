export type BookingStatus = 
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED";

export type CreateBookingRequest = {
    serviceId: string;
    date: string;
    time: string;
    address: string;
    notes?: string;
};

export type Booking = {
    id: string;
    userId: string;
    serviceId: string;
    date: string;   
    time: string;
    address: string;
    notes?: string;
    status: BookingStatus;
    createdAt: string;
}

export type CreateBookingResponse = {
    bookings: Booking;
}

export type GetMyBookingsResponse = {
    bookings: Booking[];
}

export type BookingErrorCode =
  | "SERVICE_NOT_FOUND"
  | "INVALID_DATE"
  | "TIME_SLOT_UNAVAILABLE"
  | "DOUBLE_BOOKING"
  | "UNAUTHORIZED";

export type BookingErrorResponse = {
  message: string;
  code: BookingErrorCode;
};
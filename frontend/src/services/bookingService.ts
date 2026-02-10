import { http } from "../lib/http";
import type {
    CreateBookingRequest,
    CreateBookingResponse,
    GetMyBookingsResponse,
} from "../contracts/booking.contract";

export function createBooking(payload: CreateBookingRequest) {
    return http<CreateBookingResponse>("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function getMyBookings() {
    return http<GetMyBookingsResponse>("/bookings/me");
}

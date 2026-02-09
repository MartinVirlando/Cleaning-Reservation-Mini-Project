import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../bookingService";

export function useBookingsQuery() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: getMyBookings,
  });
}

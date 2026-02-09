import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking } from "../bookingService";

export function useCreateBookingMutation(){
   const queryClient = useQueryClient();

   return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ["My Book"]});
    },
   });
}
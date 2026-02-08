import { useQuery } from "@tanstack/react-query";
import { getServices } from "../serviceService";

export function useServicesQuery() {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });
}

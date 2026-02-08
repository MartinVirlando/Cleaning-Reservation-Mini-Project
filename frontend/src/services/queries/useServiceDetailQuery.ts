import { useQuery } from "@tanstack/react-query";
import { getServiceById } from "../serviceService";

export function useServiceDetailQuery(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () => getServiceById(id),
    enabled: !!id,
  });
}

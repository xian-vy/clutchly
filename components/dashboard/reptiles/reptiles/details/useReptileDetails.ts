import { useQuery } from "@tanstack/react-query";
import { DetailedReptile, getReptileDetails } from "@/app/api/reptiles/reptileDetails";

export function useReptileDetails(reptileId: string | null) {
  return useQuery({
    queryKey: ['reptile-details', reptileId],
    queryFn: async () => {
      if (!reptileId) return null;
      const data = await getReptileDetails(reptileId);
      return data as unknown as DetailedReptile;
    },
    enabled: !!reptileId,
    staleTime: 1000 * 60 * 60, 
  });
} 
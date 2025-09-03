import { useQuery } from "@tanstack/react-query";
import { DetailedReptile, getReptileDetails } from "@/app/api/reptiles/reptileDetails";
import { CACHE_KEYS } from "@/lib/constants/cache_keys";

export function useReptileDetails(reptileId: string | null) {
  return useQuery({
    queryKey: [CACHE_KEYS.REPTILE_DETAILS, reptileId],
    queryFn: async () => {
      if (!reptileId) return null;
      const data = await getReptileDetails(reptileId);
      return data as unknown as DetailedReptile;
    },
    enabled: !!reptileId,
    staleTime: 1000 * 60 * 60, 
  });
} 
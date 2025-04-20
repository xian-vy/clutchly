import { useQuery } from "@tanstack/react-query";
import { getReptileDetails } from "@/app/api/reptiles/reptileDetails";
import { ExtendedDetailedReptile } from "./types";

export function useReptileDetails(reptileId: string | null) {
  return useQuery({
    queryKey: ['reptile-details', reptileId],
    queryFn: async () => {
      if (!reptileId) return null;
      const data = await getReptileDetails(reptileId);
      return data as unknown as ExtendedDetailedReptile;
    },
    enabled: !!reptileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 
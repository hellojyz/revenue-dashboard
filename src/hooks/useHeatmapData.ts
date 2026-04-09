import { useQuery } from '@tanstack/react-query';
import { useHeatmapStore } from '../store/useHeatmapStore';
import { fetchHeatmapData } from '../api/heatmapApi';
import type { HeatmapFilters, HeatmapDataResponse } from '../types/heatmap';

/** Serialize filters into a stable queryKey-friendly value */
function filtersToKey(filters: HeatmapFilters) {
  return {
    deviceType: filters.deviceType,
    packageType: filters.packageType,
    timePeriod: filters.timePeriod,
    customDateRange: filters.customDateRange ?? null,
  };
}

const RETRY_COUNT = 3;
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useHeatmapData() {
  const filters = useHeatmapStore((s) => s.filters);

  const query = useQuery<HeatmapDataResponse, Error>({
    queryKey: ['heatmapData', filtersToKey(filters)],
    queryFn: () => fetchHeatmapData(filters),
    retry: RETRY_COUNT,
    staleTime: STALE_TIME,
  });

  return {
    ...query,
    updatedAt: query.data?.updatedAt ?? null,
  };
}

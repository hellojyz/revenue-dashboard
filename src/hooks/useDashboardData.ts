import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '../store/useDashboardStore';
import {
  fetchKPI,
  fetchMainTrend,
  fetchCostStructure,
  fetchRevenueStructure,
  fetchWaterfall,
  fetchPackageRanking,
  fetchCostDetail,
  fetchAlerts,
  fetchRevenueForecastV2,
} from '../api/dashboard';
import type { DashboardFilters } from '../types/dashboard';

/** Serialize filters into a stable queryKey-friendly value */
function filtersToKey(filters: DashboardFilters) {
  return {
    dateRange: filters.dateRange,
    timeGranularity: filters.timeGranularity,
    orderTypes: [...filters.orderTypes].sort(),
    deviceTypes: [...filters.deviceTypes].sort(),
    productTypes: [...filters.productTypes].sort(),
    packageVersions: [...filters.packageVersions].sort(),
  };
}

const RETRY_COUNT = 3;

export function useKPIData() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['kpi', filtersToKey(filters)],
    queryFn: () => fetchKPI(filters),
    retry: RETRY_COUNT,
  });
}

export function useMainTrendData() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['mainTrend', filtersToKey(filters)],
    queryFn: () => fetchMainTrend(filters),
    retry: RETRY_COUNT,
  });
}

export function useCostStructureData() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['costStructure', filtersToKey(filters)],
    queryFn: () => fetchCostStructure(filters),
    retry: RETRY_COUNT,
  });
}

export function useRevenueStructureData() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['revenueStructure', filtersToKey(filters)],
    queryFn: () => fetchRevenueStructure(filters),
    retry: RETRY_COUNT,
  });
}

export function useWaterfallData() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['waterfall', filtersToKey(filters)],
    queryFn: () => fetchWaterfall(filters),
    retry: RETRY_COUNT,
  });
}

export function usePackageRankingData(
  dimension: 'productType' | 'packageVersion',
  metric: 'profit' | 'profitMargin' | 'revenue' | 'cost',
) {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['packageRanking', filtersToKey(filters), dimension, metric],
    queryFn: () => fetchPackageRanking(filters, dimension, metric),
    retry: RETRY_COUNT,
  });
}

export function useCostDetailData() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['costDetail', filtersToKey(filters)],
    queryFn: () => fetchCostDetail(filters),
    retry: RETRY_COUNT,
  });
}

export function useAlertData() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['alerts', filtersToKey(filters)],
    queryFn: () => fetchAlerts(filters),
    retry: RETRY_COUNT,
  });
}

export function useRevenueForecastV2Data() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['revenueForecastV2', filtersToKey(filters)],
    queryFn: () => fetchRevenueForecastV2(filters),
    retry: RETRY_COUNT,
  });
}

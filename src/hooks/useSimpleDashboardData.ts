import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '../store/useDashboardStore';
import { useI18n } from '../i18n/I18nContext';
import type { DashboardFilters } from '../types/dashboard';
import {
  fetchSimpleKPI,
  fetchSimpleMainTrend,
  fetchSimpleCrossPeriod,
  fetchSimpleNewMonthPkg,
  fetchSimpleCollection,
  fetchSimpleAlerts,
} from '../api/simpleApi';

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

export function useSimpleKPI() {
  const filters = useDashboardStore((s) => s.filters);
  const { locale } = useI18n();
  return useQuery({
    queryKey: ['simpleKPI', filtersToKey(filters), locale],
    queryFn: () => fetchSimpleKPI(filters),
    retry: RETRY_COUNT,
  });
}

export function useSimpleMainTrend() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['simpleMainTrend', filtersToKey(filters)],
    queryFn: () => fetchSimpleMainTrend(filters),
    retry: RETRY_COUNT,
  });
}

export function useSimpleCrossPeriod() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['simpleCrossPeriod', filtersToKey(filters)],
    queryFn: () => fetchSimpleCrossPeriod(filters),
    retry: RETRY_COUNT,
  });
}

export function useSimpleNewMonthPkg() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['simpleNewMonthPkg', filtersToKey(filters)],
    queryFn: () => fetchSimpleNewMonthPkg(filters),
    retry: RETRY_COUNT,
  });
}

export function useSimpleCollection() {
  const filters = useDashboardStore((s) => s.filters);
  return useQuery({
    queryKey: ['simpleCollection', filtersToKey(filters)],
    queryFn: () => fetchSimpleCollection(filters),
    retry: RETRY_COUNT,
  });
}

export function useSimpleAlerts() {
  const filters = useDashboardStore((s) => s.filters);
  const { locale } = useI18n();
  return useQuery({
    queryKey: ['simpleAlerts', filtersToKey(filters), locale],
    queryFn: () => fetchSimpleAlerts(filters),
    retry: RETRY_COUNT,
  });
}

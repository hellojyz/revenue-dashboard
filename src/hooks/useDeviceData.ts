import { useQuery } from '@tanstack/react-query';
import { useDeviceStore } from '../store/useDeviceStore';
import { fetchDeviceKPI, fetchDeviceTrend, fetchDeviceDistribution } from '../api/deviceApi';
import type { DistributionDimension } from '../types/deviceDashboard';

export function useDeviceKPIData() {
  const filters = useDeviceStore((s) => s.filters);
  return useQuery({
    queryKey: ['device-kpi', filters],
    queryFn: () => fetchDeviceKPI(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeviceTrendData() {
  const filters = useDeviceStore((s) => s.filters);
  return useQuery({
    queryKey: ['device-trend', filters],
    queryFn: () => fetchDeviceTrend(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeviceDistributionData(dimension: DistributionDimension) {
  const filters = useDeviceStore((s) => s.filters);
  return useQuery({
    queryKey: ['device-distribution', filters, dimension],
    queryFn: () => fetchDeviceDistribution(filters, dimension),
    staleTime: 5 * 60 * 1000,
  });
}

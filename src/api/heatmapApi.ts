/**
 * 热力图看板 API 请求函数
 *
 * 当前使用 mock 数据进行演示。
 * 接入真实 API 时，将 USE_MOCK 设为 false 即可切换到真实请求。
 */
import apiClient from './client';
import type { HeatmapFilters, HeatmapDataResponse } from '../types/heatmap';
import { mockHeatmapData } from './heatmapMockData';

// ★ 切换此标志即可在 mock 和真实 API 之间切换
const USE_MOCK = true;

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function filtersToParams(filters: HeatmapFilters): Record<string, string> {
  const params: Record<string, string> = {
    appName: filters.appName,
    deviceType: filters.deviceType,
    packageType: filters.packageType,
    timePeriod: filters.timePeriod,
  };
  if (filters.timePeriod === 'custom' && filters.customDateRange) {
    params.startDate = filters.customDateRange[0];
    params.endDate = filters.customDateRange[1];
  }
  return params;
}

export async function fetchHeatmapData(
  filters: HeatmapFilters,
): Promise<HeatmapDataResponse> {
  if (USE_MOCK) {
    await delay();
    let apps = mockHeatmapData.apps;
    // Filter by appName
    if (filters.appName && filters.appName !== 'all') {
      apps = apps.filter((a) => a.appName === filters.appName);
    }
    return {
      apps,
      updatedAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.get<HeatmapDataResponse>('/heatmap-data', {
    params: filtersToParams(filters),
  });
  return data;
}

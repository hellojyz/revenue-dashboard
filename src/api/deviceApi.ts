/**
 * 设备驾驶舱 API 请求函数
 *
 * 当前使用 mock 数据进行演示。
 * 接入真实 API 时，将 USE_MOCK 设为 false 即可切换到真实请求。
 */
import apiClient from './client';
import type {
  DeviceFilters,
  DeviceKPIData,
  DeviceTrendData,
  DeviceDistributionData,
  DistributionDimension,
} from '../types/deviceDashboard';
import {
  mockDeviceKPI,
  mockDeviceTrend,
  mockDeviceDistributions,
} from './deviceMockData';

// ★ 切换此标志即可在 mock 和真实 API 之间切换
const USE_MOCK = true;

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function filtersToParams(filters: DeviceFilters): Record<string, string> {
  const params: Record<string, string> = {
    timeRange: filters.timeRange,
    region: filters.region.join(','),
    channel: filters.channel.join(','),
    model: filters.model.join(','),
    firmwareVersion: filters.firmwareVersion.join(','),
    appVersion: filters.appVersion.join(','),
    powerType: filters.powerType.join(','),
    lifecycleStage: filters.lifecycleStage.join(','),
  };
  if (filters.timeRange === 'custom' && filters.customDateRange) {
    params.startDate = filters.customDateRange[0];
    params.endDate = filters.customDateRange[1];
  }
  return params;
}

/** 获取设备 KPI 数据 */
export async function fetchDeviceKPI(
  filters: DeviceFilters,
): Promise<DeviceKPIData> {
  if (USE_MOCK) {
    await delay();
    return { ...mockDeviceKPI, updatedAt: new Date().toISOString() };
  }
  const { data } = await apiClient.get<DeviceKPIData>('/device/kpi', {
    params: filtersToParams(filters),
  });
  return data;
}

/** 获取设备趋势数据（规模 / 在线率 / 电源类型 / 接入方式） */
export async function fetchDeviceTrend(
  filters: DeviceFilters,
): Promise<DeviceTrendData> {
  if (USE_MOCK) {
    await delay();
    return { ...mockDeviceTrend, updatedAt: new Date().toISOString() };
  }
  const { data } = await apiClient.get<DeviceTrendData>('/device/trend', {
    params: filtersToParams(filters),
  });
  return data;
}

/** 获取设备分布数据（机型 / 区域 / 渠道 / 生命周期阶段） */
export async function fetchDeviceDistribution(
  filters: DeviceFilters,
  dimension: DistributionDimension,
): Promise<DeviceDistributionData> {
  if (USE_MOCK) {
    await delay();
    const dist = mockDeviceDistributions[dimension];
    return { ...dist, updatedAt: new Date().toISOString() };
  }
  const { data } = await apiClient.get<DeviceDistributionData>(
    '/device/distribution',
    { params: { ...filtersToParams(filters), dimension } },
  );
  return data;
}

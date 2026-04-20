// src/types/deviceDashboard.ts

export type DeviceRegion = 'china' | 'north_america' | 'europe' | 'southeast_asia' | 'other' | string;
export type DeviceChannel = 'online' | 'offline' | 'operator' | string;
export type DeviceModel = string;
export type FirmwareVersion = string;
export type AppVersion = string;
export type PowerType = 'all' | 'wired' | 'low_power';
export type LifecycleStage = 'new' | 'growth' | 'mature' | 'decline';
export type DistributionDimension = 'model' | 'region' | 'channel' | 'lifecycle';
export type TimeRange = 'last_12_months' | 'last_6_months' | 'last_3_months' | 'custom';

export interface DeviceFilters {
  timeRange: TimeRange;
  customDateRange?: [string, string];
  region: DeviceRegion[];
  channel: DeviceChannel[];
  model: DeviceModel[];
  firmwareVersion: FirmwareVersion[];
  appVersion: AppVersion[];
  powerType: PowerType[];
  lifecycleStage: LifecycleStage[];
}

export interface DeviceKPIItem {
  value: number | null;
  changePercent: number | null;
  sparkline: number[];
}

export interface DeviceKPIData {
  totalDevices: DeviceKPIItem;
  activatedDevices: DeviceKPIItem;
  activeDevices: DeviceKPIItem;
  onlineRate: DeviceKPIItem;
  churnRatio: DeviceKPIItem;
  updatedAt: string;
}

// 通用时序数据点（支持周/月粒度）
export interface TimeSeriesPoint {
  period: string;      // 如 "2025-01"（月）或 "2025-W01"（周）或 "2025-01-06"（日）
  dateRange: string;   // tooltip 用，如 "2025-01-01 ~ 2025-01-31"
  [key: string]: number | string | null;
}

// 规模-激活-活跃趋势（图表1，左上）
// TimeSeriesPoint 包含字段：totalDevices, activatedDevices, activeDevices
export interface DeviceScaleTrendData {
  points: TimeSeriesPoint[];
}

// 在线稳定性趋势（图表2，右上）
// TimeSeriesPoint 包含字段：onlineRate, offlineRate, frequentOfflineCount
export interface DeviceOnlineTrendData {
  points: TimeSeriesPoint[];
}

// 供电健康趋势（图表3，左下）
// TimeSeriesPoint 包含字段：dailyPowerConsumption, chargingAbnormalCount, highPowerRatio
export interface DevicePowerTrendData {
  points: TimeSeriesPoint[];
}

// 接入与体验健康趋势（图表4，右下）
// TimeSeriesPoint 包含字段：firstNetworkSuccessRate, finalWifiSuccessRate, previewLatency, sdCardLossCount
export interface DeviceAccessTrendData {
  points: TimeSeriesPoint[];
}

export interface DeviceTrendData {
  scale: DeviceScaleTrendData;
  online: DeviceOnlineTrendData;
  power: DevicePowerTrendData;
  access: DeviceAccessTrendData;
  updatedAt: string;
}

export interface DistributionItem {
  label: string;
  value: number;
  ratio: number;
  highlighted?: boolean;
}

export interface DeviceDistributionData {
  dimension: DistributionDimension;
  items: DistributionItem[];
  updatedAt: string;
}

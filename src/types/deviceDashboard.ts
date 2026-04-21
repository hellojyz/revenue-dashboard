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
  changePercent: number | null;   // 环比
  yoyPercent?: number | null;     // 同比
  sparkline: number[];
}

export interface DeviceKPIData {
  totalDevices: DeviceKPIItem;
  activatedDevices: DeviceKPIItem;
  activeDevices: DeviceKPIItem;
  onlineRate: DeviceKPIItem;
  churnDevices: DeviceKPIItem;    // 流失设备数（本期值+流失率趋势）
  updatedAt: string;
}

// 供电健康：耗电分布（柱状图，静态分布数据）
export interface PowerDistributionBucket {
  label: string;   // 如 "0-20%"
  ratio: number;   // 设备占比 0~1
}

export interface DevicePowerDistributionData {
  buckets: PowerDistributionBucket[];
}

// 预览时长分布（柱状图，静态分布数据）
export interface PreviewDurationBucket {
  label: string;   // 如 "0-5s"
  count: number;   // 设备数
}

export interface DevicePreviewDurationData {
  buckets: PreviewDurationBucket[];
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

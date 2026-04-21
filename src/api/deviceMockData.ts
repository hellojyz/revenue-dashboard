/**
 * 设备驾驶舱 Mock 数据
 * 提供近12个月的 KPI、趋势图、分布图模拟数据，用于前端预览和演示
 */
import type {
  DeviceKPIData,
  DeviceTrendData,
  DeviceDistributionData,
  DistributionDimension,
  TimeSeriesPoint,
} from '../types/deviceDashboard';

// ─── 工具函数 ────────────────────────────────────────────────────────────────

/** 在基准值上叠加随机波动 */
function jitter(base: number, pct = 0.05): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * 2 * pct));
}

function jitterFloat(base: number, pct = 0.05): number {
  return parseFloat((base * (1 + (Math.random() - 0.5) * 2 * pct)).toFixed(4));
}

/** 生成近12个月的月标识列表，格式 "2025-01"，从2024-05到2025-04 */
function generateMonthLabels(): string[] {
  const months: string[] = [];
  // 2024-05 to 2025-04 = 12 months
  const start = new Date(2024, 4, 1); // May 2024
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }
  return months;
}

/** 根据月标识生成对应的日期范围字符串 */
function monthToDateRange(monthLabel: string): string {
  const [y, m] = monthLabel.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `${monthLabel}-01 ~ ${monthLabel}-${String(lastDay).padStart(2, '0')}`;
}

const MONTHS = generateMonthLabels();

// ─── KPI Mock 数据 ────────────────────────────────────────────────────────────

const sparklineBase = {
  totalDevices:    [1100000, 1110000, 1120000, 1130000, 1140000, 1150000, 1160000, 1170000, 1180000, 1190000, 1200000, 1210000],
  activatedDevices:[870000,  880000,  890000,  900000,  910000,  920000,  930000,  940000,  950000,  960000,  970000,  980000],
  activeDevices:   [660000,  670000,  680000,  690000,  700000,  710000,  715000,  718000,  720000,  722000,  724000,  726000],
  onlineRate:      [0.87, 0.875, 0.878, 0.880, 0.882, 0.884, 0.883, 0.881, 0.879, 0.878, 0.880, 0.882],
  churnRatio:      [0.13, 0.128, 0.126, 0.124, 0.122, 0.121, 0.120, 0.119, 0.118, 0.117, 0.116, 0.118],
};

export const mockDeviceKPI: DeviceKPIData = {
  totalDevices: {
    value: 1210000,
    changePercent: 0.022,
    yoyPercent: 0.085,
    sparkline: sparklineBase.totalDevices,
  },
  activatedDevices: {
    value: 980000,
    changePercent: 0.028,
    yoyPercent: 0.092,
    sparkline: sparklineBase.activatedDevices,
  },
  activeDevices: {
    value: 726000,
    changePercent: 0.034,
    yoyPercent: null,
    sparkline: sparklineBase.activeDevices,
  },
  onlineRate: {
    value: 0.882,
    changePercent: 0.023,
    sparkline: sparklineBase.onlineRate,
  },
  churnDevices: {
    value: 42000,
    changePercent: -0.077,
    sparkline: [48000, 47000, 46000, 45000, 44000, 43500, 43000, 42800, 42500, 42200, 42000, 42000],
  },
  updatedAt: new Date().toISOString(),
};

// ─── 趋势 Mock 数据 ───────────────────────────────────────────────────────────

/** 设备规模趋势：总设备数 / 激活设备数 / 活跃设备数 */
const scaleTrendPoints: TimeSeriesPoint[] = MONTHS.map((period, i) => ({
  period,
  dateRange: monthToDateRange(period),
  totalDevices:     jitter(sparklineBase.totalDevices[i], 0.01),
  activatedDevices: jitter(sparklineBase.activatedDevices[i], 0.01),
  activeDevices:    jitter(sparklineBase.activeDevices[i], 0.01),
}));

/** 在线稳定性趋势：在线率 / 离线率 / 频繁上下线设备数 */
const onlineTrendPoints: TimeSeriesPoint[] = MONTHS.map((period, i) => {
  const onlineRate = jitterFloat(sparklineBase.onlineRate[i], 0.01);
  return {
    period,
    dateRange: monthToDateRange(period),
    onlineRate,
    offlineRate: parseFloat((1 - onlineRate).toFixed(4)),
    frequentOfflineCount: jitter(1200, 0.15),
  };
});

/** 供电健康趋势：日耗电量 / 充电异常设备数 / 高耗电占比 */
const powerTrendPoints: TimeSeriesPoint[] = MONTHS.map((period, i) => {
  // 偶发充电异常超500触发告警（约每4个月一次）
  const chargingAbnormalCount = i % 4 === 2 ? jitter(520, 0.05) : jitter(320, 0.15);
  return {
    period,
    dateRange: monthToDateRange(period),
    dailyPowerConsumption: jitterFloat(3.2, 0.08),
    chargingAbnormalCount,
    highPowerRatio: jitterFloat(0.12, 0.10),
  };
});

/** 接入与体验健康趋势：首次配网成功率 / 最终WiFi配网成功率 / 设备预览耗时 / SD卡录像丢失设备数 */
const accessTrendPoints: TimeSeriesPoint[] = MONTHS.map((period) => ({
  period,
  dateRange: monthToDateRange(period),
  firstNetworkSuccessRate: jitterFloat(0.83, 0.05),
  finalWifiSuccessRate:    jitterFloat(0.92, 0.03),
  previewLatency:          jitter(1800, 0.10),
  sdCardLossCount:         jitter(85, 0.20),
}));

export const mockDeviceTrend: DeviceTrendData = {
  scale:  { points: scaleTrendPoints },
  online: { points: onlineTrendPoints },
  power:  { points: powerTrendPoints },
  access: { points: accessTrendPoints },
  updatedAt: new Date().toISOString(),
};

// ─── 分布 Mock 数据 ───────────────────────────────────────────────────────────

const totalForDist = 1210000;

const distributionMap: Record<DistributionDimension, { label: string; value: number }[]> = {
  model: [
    { label: '摄像头A', value: Math.round(totalForDist * 0.28) },
    { label: '摄像头B', value: Math.round(totalForDist * 0.22) },
    { label: '门铃Pro', value: Math.round(totalForDist * 0.18) },
    { label: '室内Mini', value: Math.round(totalForDist * 0.15) },
    { label: '太阳能款', value: Math.round(totalForDist * 0.10) },
    { label: '其他',    value: Math.round(totalForDist * 0.07) },
  ],
  region: [
    { label: '中国',     value: Math.round(totalForDist * 0.35) },
    { label: '北美',     value: Math.round(totalForDist * 0.30) },
    { label: '欧洲',     value: Math.round(totalForDist * 0.20) },
    { label: '东南亚',   value: Math.round(totalForDist * 0.10) },
    { label: '其他地区', value: Math.round(totalForDist * 0.05) },
  ],
  channel: [
    { label: '线上渠道', value: Math.round(totalForDist * 0.50) },
    { label: '线下渠道', value: Math.round(totalForDist * 0.30) },
    { label: '运营商',   value: Math.round(totalForDist * 0.20) },
  ],
  lifecycle: [
    { label: '新品期', value: Math.round(totalForDist * 0.15) },
    { label: '成长期', value: Math.round(totalForDist * 0.25) },
    { label: '成熟期', value: Math.round(totalForDist * 0.40) },
    { label: '衰退期', value: Math.round(totalForDist * 0.20) },
  ],
};

function buildDistribution(dimension: DistributionDimension): DeviceDistributionData {
  const raw = distributionMap[dimension];
  const total = raw.reduce((s, d) => s + d.value, 0);
  const items = raw.map((d) => ({
    label: d.label,
    value: d.value,
    ratio: parseFloat((d.value / total).toFixed(4)),
    highlighted: false,
  }));
  return { dimension, items, updatedAt: new Date().toISOString() };
}

export const mockDeviceDistributions: Record<DistributionDimension, DeviceDistributionData> = {
  model:     buildDistribution('model'),
  region:    buildDistribution('region'),
  channel:   buildDistribution('channel'),
  lifecycle: buildDistribution('lifecycle'),
};

// ─── 供电健康：耗电分布 Mock 数据 ─────────────────────────────────────────────

export const mockPowerDistribution = {
  buckets: [
    { label: '0-20%',  ratio: 0.42 },
    { label: '20-50%', ratio: 0.31 },
    { label: '50-80%', ratio: 0.18 },
    { label: '80%以上', ratio: 0.09 },
  ],
};

// ─── 预览时长分布 Mock 数据 ───────────────────────────────────────────────────

export const mockPreviewDuration = {
  buckets: [
    { label: '0-5s',   count: 185000 },
    { label: '5-15s',  count: 312000 },
    { label: '15-30s', count: 148000 },
    { label: '30s以上', count: 81000 },
  ],
};

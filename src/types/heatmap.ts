// ============================================================
// APP核心指标热力图看板 类型定义
// ============================================================

// ============================================================
// 枚举/联合类型
// ============================================================

/** 设备类型 */
export type DeviceType = 'all' | '4g_camera' | 'battery_camera' | 'wired_camera' | 'doorbell' | 'light' | 'mini_camera';

/** 套餐类型 */
export type PackageType = 'all' | 'yearly' | 'monthly' | 'half_yearly' | 'quarterly' | 'daily';

/** 时间周期 */
export type TimePeriod = 'last_7_days' | 'last_30_days' | 'natural_month' | 'custom';

/** 热力图指标键 */
export type HeatmapMetricKey =
  | 'deviceCount'
  | 'subscriptionConversionRate'
  | 'subscriptionRetentionRate'
  | 'revenuePerDevice';

/** 告警级别 */
export type AlertSeverity = 'critical' | 'warning' | 'normal';

/** 色阶级别 */
export type HeatmapColorLevel = 'excellent' | 'normal' | 'warning' | 'critical';

/** 归因方向类型 */
export type AttributionDirection = string;

/** 归因模板映射：指标键 → 预定义归因方向集合 */
export type AttributionTemplateMap = Record<HeatmapMetricKey, AttributionDirection[]>;

// ============================================================
// 筛选条件
// ============================================================

/** 热力图筛选条件 */
export interface HeatmapFilters {
  appName: string;           // 'all' 或具体APP名称
  deviceType: DeviceType;
  packageType: PackageType;
  timePeriod: TimePeriod;
  customDateRange?: [string, string]; // 仅 timePeriod='custom' 时有效
}

// ============================================================
// 核心数据模型
// ============================================================

/** 单个APP的指标数据 */
export interface HeatmapAppMetric {
  appName: string;
  deviceCount: number | null;                // 设备数（NULL表示无数据）
  subscriptionConversionRate: number | null;  // 设备增值订阅转化率 (0~1)
  subscriptionRetentionRate: number | null;   // 设备增值订阅留存率 (0~1)
  revenuePerDevice: number | null;           // 单设备收益 (元)
  deviceType: string;                        // 设备类型标签
  packageType: string;                       // 套餐类型标签
  yoyChange: Record<HeatmapMetricKey, number | null>;  // 同比变化（如 0.05 = 5%上升，-0.03 = 3%下降）
  momChange: Record<HeatmapMetricKey, number | null>;  // 环比变化
}

// ============================================================
// 告警相关
// ============================================================

/** 热力图告警项 */
export interface HeatmapAlertItem {
  id: string;
  appName: string;
  metricKey: HeatmapMetricKey;
  metricLabel: string;
  severity: AlertSeverity;
  currentValue: number;
  threshold: number;       // 触发的阈值（黄线或红线）
  deviation: number;       // 偏离度（与阈值的差值比例）
  attributionText: string; // 归因文案
}

/** 波动型告警项 */
export interface HeatmapVolatilityAlert {
  appName: string;
  metricKey: HeatmapMetricKey;
  type: 'yoy' | 'mom';      // 同比或环比
  changePercent: number;     // 变化幅度（如 0.15 = 15%）
}

// ============================================================
// 联动与排序
// ============================================================

/** 联动高亮状态 */
export interface HeatmapHighlight {
  appName: string;
  metricKey?: HeatmapMetricKey; // 可选，仅高亮特定指标
}

/** 排序配置 */
export interface HeatmapSortConfig {
  field: HeatmapMetricKey | 'appName';
  order: 'asc' | 'desc';
}

// ============================================================
// 阈值配置
// ============================================================

/** 热力图告警阈值配置 */
export interface HeatmapThresholds {
  deviceCount: { yellow: number; red: number };
  subscriptionConversionRate: { yellow: number; red: number };
  subscriptionRetentionRate: { yellow: number; red: number };
  revenuePerDevice: { yellow: number; red: number };
}

/** 波动型告警阈值配置 */
export interface HeatmapVolatilityThresholds {
  yoyMax: number;  // 同比变化幅度阈值（如 0.2 = 20%）
  momMax: number;  // 环比变化幅度阈值（如 0.15 = 15%）
}

// ============================================================
// API 响应
// ============================================================

/** 热力图数据API响应 */
export interface HeatmapDataResponse {
  apps: HeatmapAppMetric[];
  updatedAt: string; // 数据更新时间
}

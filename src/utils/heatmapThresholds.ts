/**
 * APP核心指标热力图看板 — 阈值配置与工具函数
 */

import type {
  HeatmapThresholds,
  HeatmapVolatilityThresholds,
  HeatmapMetricKey,
  HeatmapColorLevel,
  HeatmapAppMetric,
  HeatmapAlertItem,
  HeatmapVolatilityAlert,
  HeatmapFilters,
  HeatmapSortConfig,
  TimePeriod,
  AttributionDirection,
} from '../types/heatmap';

// ============================================================
// 常量
// ============================================================

/** 默认热力图告警阈值 */
export const DEFAULT_HEATMAP_THRESHOLDS: HeatmapThresholds = {
  deviceCount: { yellow: 5000, red: 2000 },
  subscriptionConversionRate: { yellow: 0.2, red: 0.1 },
  subscriptionRetentionRate: { yellow: 0.5, red: 0.45 },
  revenuePerDevice: { yellow: 20, red: 15 },
};

/** 默认波动型告警阈值 */
export const DEFAULT_VOLATILITY_THRESHOLDS: HeatmapVolatilityThresholds = {
  yoyMax: 0.2,
  momMax: 0.15,
};

/** 指标中文标签 */
export const METRIC_LABELS: Record<HeatmapMetricKey, string> = {
  deviceCount: '设备数',
  subscriptionConversionRate: '设备增值订阅转化率',
  subscriptionRetentionRate: '设备增值订阅留存率',
  revenuePerDevice: '单设备收益',
};

/** 设备类型标签 */
export const DEVICE_TYPE_LABELS: Record<string, string> = {
  all: '全部',
  '4g_camera': '4G摄像机',
  battery_camera: '电池摄像机',
  wired_camera: '常电摄像机',
  doorbell: '访客门铃',
  light: '灯具',
  mini_camera: '迷你摄像机',
};

/** 套餐类型标签 */
export const PACKAGE_TYPE_LABELS: Record<string, string> = {
  all: '全部',
  yearly: '年包',
  monthly: '月包',
  half_yearly: '半年包',
  quarterly: '季包',
  daily: '天',
};

/** 时间周期标签 */
export const TIME_PERIOD_LABELS: Record<string, string> = {
  last_7_days: '近7天',
  last_30_days: '近30天',
  natural_month: '自然月',
  custom: '自定义',
};

/** APP名称列表 */
export const APP_NAME_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'ANRAN', label: 'ANRAN' },
  { value: 'Cococam', label: 'Cococam' },
  { value: 'ieGeek Cam', label: 'ieGeek Cam' },
  { value: 'Meari', label: 'Meari' },
  { value: 'Arenti', label: 'Arenti' },
  { value: 'COOAU', label: 'COOAU' },
  { value: 'Ctronics', label: 'Ctronics' },
  { value: 'ZOSI', label: 'ZOSI' },
  { value: 'Hiseeu', label: 'Hiseeu' },
  { value: 'GALAYOU', label: 'GALAYOU' },
  { value: 'DEKCO', label: 'DEKCO' },
  { value: 'FloodLight Cam', label: 'FloodLight Cam' },
  { value: 'BabyMonitor', label: 'BabyMonitor' },
  { value: 'PetCam', label: 'PetCam' },
  { value: 'SolarCam', label: 'SolarCam' },
  { value: 'DoorBell Pro', label: 'DoorBell Pro' },
  { value: 'PTZ Outdoor', label: 'PTZ Outdoor' },
  { value: 'Mini Indoor', label: 'Mini Indoor' },
];

// ============================================================
// 指标键列表（固定顺序）
// ============================================================

const METRIC_KEYS: HeatmapMetricKey[] = [
  'deviceCount',
  'subscriptionConversionRate',
  'subscriptionRetentionRate',
  'revenuePerDevice',
];

// ============================================================
// 算法2：热力图色阶映射
// ============================================================

/**
 * 四级色阶映射
 * - value ≤ red → critical
 * - red < value ≤ yellow → warning
 * - yellow < value ≤ excellentLine (yellow × 2) → normal
 * - value > excellentLine → excellent
 */
export function getColorLevel(
  value: number,
  metricKey: HeatmapMetricKey,
  thresholds: HeatmapThresholds,
): HeatmapColorLevel {
  const { red, yellow } = thresholds[metricKey];
  const excellent = yellow * 2;

  if (value <= red) return 'critical';
  if (value <= yellow) return 'warning';
  if (value <= excellent) return 'normal';
  return 'excellent';
}

// ============================================================
// 算法7：区间内深浅增强
// ============================================================

/**
 * 返回 0~1 的区间内相对位置，不改变主风险类别。
 * 值越接近区间上界 → 1（颜色越浅）
 * 值越接近区间下界 → 0（颜色越深）
 */
export function getColorIntensity(
  value: number,
  metricKey: HeatmapMetricKey,
  thresholds: HeatmapThresholds,
): number {
  const { red, yellow } = thresholds[metricKey];
  const excellent = yellow * 2;

  let lowerBound: number;
  let upperBound: number;

  if (value <= red) {
    lowerBound = 0;
    upperBound = red;
  } else if (value <= yellow) {
    lowerBound = red;
    upperBound = yellow;
  } else if (value <= excellent) {
    lowerBound = yellow;
    upperBound = excellent;
  } else {
    lowerBound = excellent;
    upperBound = excellent * 2;
  }

  if (upperBound === lowerBound) return 0.5;

  const intensity = (value - lowerBound) / (upperBound - lowerBound);
  return Math.max(0, Math.min(1, intensity));
}

// ============================================================
// 算法10：指标展示格式化
// ============================================================

/**
 * 指标展示格式化
 * - deviceCount → 整数 (如 '12345')
 * - subscriptionConversionRate / subscriptionRetentionRate → 百分比 1位小数 (如 '25.3%')
 * - revenuePerDevice → 2位小数 + '元' (如 '18.50元')
 * - null → '--'
 */
export function formatMetricDisplay(
  value: number | null,
  metricKey: HeatmapMetricKey,
): string {
  if (value === null || value === undefined) return '--';

  switch (metricKey) {
    case 'deviceCount':
      return String(Math.round(value));
    case 'subscriptionConversionRate':
    case 'subscriptionRetentionRate':
      return `${(value * 100).toFixed(1)}%`;
    case 'revenuePerDevice':
      return `${value.toFixed(2)}元`;
    default:
      return String(value);
  }
}

// ============================================================
// 算法6：归因模板
// ============================================================

/** 归因模板：按指标类型返回预定义归因方向集合 */
export function getAttributionTemplate(metricKey: HeatmapMetricKey): AttributionDirection[] {
  const templates: Record<HeatmapMetricKey, AttributionDirection[]> = {
    subscriptionConversionRate: [
      '新增设备占比变化',
      '高价值套餐渗透率变化',
      '付费设备数变化',
    ],
    subscriptionRetentionRate: [
      '到期设备数上升',
      '续费设备数下降',
      '某套餐流失异常',
    ],
    revenuePerDevice: [
      '付费套餐结构下移',
      '高单价套餐渗透下降',
    ],
    deviceCount: [
      '某类型设备激活率下降',
      '某类型设备销量下降',
    ],
  };

  return templates[metricKey] ?? [];
}

// ============================================================
// 算法3：归因文案生成
// ============================================================

/**
 * 基于归因模板生成归因文案。
 * 选取 1~2 个最相关原因；无法识别时输出默认文案。
 */
export function generateAttribution(
  appName: string,
  metricKey: HeatmapMetricKey,
  currentValue: number,
  threshold: number,
  filters: HeatmapFilters,
): string {
  const metricLabel = METRIC_LABELS[metricKey];
  const formattedValue = formatMetricDisplay(currentValue, metricKey);
  const formattedThreshold = formatMetricDisplay(threshold, metricKey);

  const defaultFallback =
    `${appName} 的 ${metricLabel} 当前为 ${formattedValue}，低于阈值 ${formattedThreshold}。当前维度下未识别出显著单一原因，请结合明细进一步排查`;

  const directions = getAttributionTemplate(metricKey);
  if (directions.length === 0) return defaultFallback;

  // 选取 1~2 个原因：根据筛选维度做简单匹配
  const selected = selectTopReasons(directions, filters, 2);
  if (selected.length === 0) return defaultFallback;

  const reasonText = selected.join('、');
  return (
    `${appName} 的 ${metricLabel} 当前为 ${formattedValue}，` +
    `低于阈值 ${formattedThreshold}。` +
    `可能原因：${reasonText}`
  );
}

/**
 * 从归因方向中选取最多 maxCount 个原因。
 * 简单策略：优先选取与当前筛选维度相关的方向，不足时按顺序补充。
 */
function selectTopReasons(
  directions: AttributionDirection[],
  filters: HeatmapFilters,
  maxCount: number,
): AttributionDirection[] {
  if (directions.length === 0) return [];

  // 根据筛选条件做简单相关性排序
  const relevant: AttributionDirection[] = [];
  const rest: AttributionDirection[] = [];

  for (const d of directions) {
    // 如果筛选了特定设备类型，优先选含"设备"/"类型"的方向
    if (filters.deviceType !== 'all' && (d.includes('设备') || d.includes('类型'))) {
      relevant.push(d);
    } else if (filters.packageType !== 'all' && (d.includes('套餐') || d.includes('渗透'))) {
      relevant.push(d);
    } else {
      rest.push(d);
    }
  }

  const combined = [...relevant, ...rest];
  return combined.slice(0, maxCount);
}

// ============================================================
// 算法1：告警检测与分级
// ============================================================

let alertIdCounter = 0;

/**
 * 绝对阈值告警检测、分级和排序。
 * - value ≤ red → critical
 * - red < value ≤ yellow → warning
 * - value > yellow → 不生成告警
 * 排序：critical > warning，同级按 deviation desc，再按 appName asc
 */
export function evaluateAlerts(
  apps: HeatmapAppMetric[],
  thresholds: HeatmapThresholds,
  filters: HeatmapFilters,
): HeatmapAlertItem[] {
  const alerts: HeatmapAlertItem[] = [];

  for (const app of apps) {
    for (const metricKey of METRIC_KEYS) {
      const value = app[metricKey];
      if (value === null || value === undefined) continue;

      const { yellow: yellowLine, red: redLine } = thresholds[metricKey];
      let severity: 'critical' | 'warning';
      let threshold: number;
      let deviation: number;

      if (value <= redLine) {
        severity = 'critical';
        threshold = redLine;
        deviation = redLine === 0 ? 0 : (redLine - value) / redLine;
      } else if (value <= yellowLine) {
        severity = 'warning';
        threshold = yellowLine;
        deviation = yellowLine === 0 ? 0 : (yellowLine - value) / yellowLine;
      } else {
        continue; // 正常，跳过
      }

      const attribution = generateAttribution(
        app.appName,
        metricKey,
        value,
        threshold,
        filters,
      );

      alertIdCounter += 1;
      alerts.push({
        id: `alert-${app.appName}-${metricKey}-${alertIdCounter}`,
        appName: app.appName,
        metricKey,
        metricLabel: METRIC_LABELS[metricKey],
        severity,
        currentValue: value,
        threshold,
        deviation,
        attributionText: attribution,
      });
    }
  }

  // 排序：severity desc (critical > warning), deviation desc, appName asc
  alerts.sort((a, b) => {
    // critical 优先于 warning
    if (a.severity !== b.severity) {
      return a.severity === 'critical' ? -1 : 1;
    }
    // 同级按偏离度降序
    if (a.deviation !== b.deviation) {
      return b.deviation - a.deviation;
    }
    // 偏离度相同按 appName 升序
    return a.appName.localeCompare(b.appName);
  });

  return alerts;
}

// ============================================================
// 算法5：波动型告警检测
// ============================================================

/**
 * 波动型告警检测：基于 yoyChange / momChange 判断同比/环比异常。
 * 不替代绝对阈值告警等级，仅作为辅助风险提示。
 */
export function evaluateVolatilityAlerts(
  apps: HeatmapAppMetric[],
  volatilityThresholds: HeatmapVolatilityThresholds,
): HeatmapVolatilityAlert[] {
  const alerts: HeatmapVolatilityAlert[] = [];

  for (const app of apps) {
    for (const metricKey of METRIC_KEYS) {
      // 同比
      const yoyVal = app.yoyChange?.[metricKey] ?? null;
      if (yoyVal !== null && Math.abs(yoyVal) > volatilityThresholds.yoyMax) {
        alerts.push({
          appName: app.appName,
          metricKey,
          type: 'yoy',
          changePercent: yoyVal,
        });
      }

      // 环比
      const momVal = app.momChange?.[metricKey] ?? null;
      if (momVal !== null && Math.abs(momVal) > volatilityThresholds.momMax) {
        alerts.push({
          appName: app.appName,
          metricKey,
          type: 'mom',
          changePercent: momVal,
        });
      }
    }
  }

  return alerts;
}

// ============================================================
// 数据验证
// ============================================================

/**
 * 验证单条 APP 指标数据的有效性。
 * - deviceCount: >= 0 整数 或 null
 * - subscriptionConversionRate: [0, 1] 或 null
 * - subscriptionRetentionRate: [0, 1] 或 null
 * - revenuePerDevice: >= 0 或 null
 * - appName: 非空字符串
 *
 * 返回 true 表示数据有效。
 */
export function validateAppMetric(metric: HeatmapAppMetric): boolean {
  // appName 非空字符串
  if (typeof metric.appName !== 'string' || metric.appName.trim() === '') {
    return false;
  }

  // deviceCount: null 或 非负整数
  if (metric.deviceCount !== null) {
    if (
      typeof metric.deviceCount !== 'number' ||
      !Number.isFinite(metric.deviceCount) ||
      metric.deviceCount < 0 ||
      !Number.isInteger(metric.deviceCount)
    ) {
      return false;
    }
  }

  // subscriptionConversionRate: null 或 [0, 1]
  if (metric.subscriptionConversionRate !== null) {
    if (
      typeof metric.subscriptionConversionRate !== 'number' ||
      !Number.isFinite(metric.subscriptionConversionRate) ||
      metric.subscriptionConversionRate < 0 ||
      metric.subscriptionConversionRate > 1
    ) {
      return false;
    }
  }

  // subscriptionRetentionRate: null 或 [0, 1]
  if (metric.subscriptionRetentionRate !== null) {
    if (
      typeof metric.subscriptionRetentionRate !== 'number' ||
      !Number.isFinite(metric.subscriptionRetentionRate) ||
      metric.subscriptionRetentionRate < 0 ||
      metric.subscriptionRetentionRate > 1
    ) {
      return false;
    }
  }

  // revenuePerDevice: null 或 >= 0
  if (metric.revenuePerDevice !== null) {
    if (
      typeof metric.revenuePerDevice !== 'number' ||
      !Number.isFinite(metric.revenuePerDevice) ||
      metric.revenuePerDevice < 0
    ) {
      return false;
    }
  }

  return true;
}

// ============================================================
// 算法8：同值回退排序
// ============================================================

/** 回退排序优先级（不含 appName，appName 作为最终兜底） */
const TIE_BREAK_FIELDS: HeatmapMetricKey[] = [
  'deviceCount',
  'revenuePerDevice',
  'subscriptionConversionRate',
  'subscriptionRetentionRate',
];

/**
 * 比较两个值，NULL 排末尾（无论升序或降序），0 视为有效数值。
 */
function compareValues(
  valA: number | null | undefined,
  valB: number | null | undefined,
  order: 'asc' | 'desc',
): number {
  const aNull = valA === null || valA === undefined;
  const bNull = valB === null || valB === undefined;

  if (aNull && bNull) return 0;
  if (aNull) return 1;  // A 排后面
  if (bNull) return -1; // B 排后面

  if (order === 'asc') {
    return (valA as number) - (valB as number);
  }
  return (valB as number) - (valA as number);
}

/**
 * 同值回退排序。
 * 主排序字段按 sortConfig 指定方向排序。
 * 同值时按回退优先级排序（降序）：设备数 > 单设备收益 > 转化率 > 留存率
 * 以上仍相同则按 APP 名称升序。
 * NULL 排末尾（无论升序或降序），0 视为有效数值。
 */
export function sortWithTieBreaking(
  data: HeatmapAppMetric[],
  sortConfig: HeatmapSortConfig,
): HeatmapAppMetric[] {
  return [...data].sort((a, b) => {
    // 主排序字段
    let result: number;
    if (sortConfig.field === 'appName') {
      const aName = a.appName ?? '';
      const bName = b.appName ?? '';
      result = sortConfig.order === 'asc'
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    } else {
      result = compareValues(a[sortConfig.field], b[sortConfig.field], sortConfig.order);
    }
    if (result !== 0) return result;

    // 同值回退排序（始终降序，除 appName 为升序）
    for (const tieField of TIE_BREAK_FIELDS) {
      if (tieField === sortConfig.field) continue;
      result = compareValues(a[tieField], b[tieField], 'desc');
      if (result !== 0) return result;
    }

    // 最终兜底：appName 升序
    if (sortConfig.field !== 'appName') {
      result = (a.appName ?? '').localeCompare(b.appName ?? '');
      if (result !== 0) return result;
    }

    return 0;
  });
}

// ============================================================
// 算法9：时间口径计算
// ============================================================

/**
 * 时间口径计算。
 * - 近7天：含今天在内的连续7天（今天往前推6天至今天）
 * - 近30天：含今天在内的连续30天（今天往前推29天至今天）
 * - 自然月：当月1日至当前日期
 * - 自定义：等于传入的 customRange（闭区间）
 *
 * 返回 [startDate, endDate]，格式 'YYYY-MM-DD'
 */
export function computeDateRange(
  timePeriod: TimePeriod,
  customRange?: [string, string],
): [string, string] {
  const today = new Date();
  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatDate(today);

  switch (timePeriod) {
    case 'last_7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return [formatDate(start), todayStr];
    }
    case 'last_30_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return [formatDate(start), todayStr];
    }
    case 'natural_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return [formatDate(start), todayStr];
    }
    case 'custom': {
      if (!customRange) {
        throw new Error('customRange is required when timePeriod is "custom"');
      }
      return [customRange[0], customRange[1]];
    }
    default:
      throw new Error(`Unknown timePeriod: ${timePeriod}`);
  }
}

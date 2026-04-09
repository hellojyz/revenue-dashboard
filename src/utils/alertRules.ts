/**
 * 告警规则计算函数
 * 实现利润率、手续费率、流量成本的告警检测与排序
 */

import type { AlertItem, AlertThresholds } from '../types/dashboard';

/** 默认告警阈值配置 */
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  profitMarginMin: 0.1,                // 利润率最低阈值 10%
  paymentFeeChangeMax: 0.05,           // 手续费率环比变化最大阈值 5%
  trafficCostPerDeviceChangeMax: 0.1,  // 单设备流量成本环比变化最大阈值 10%
};

/**
 * 获取有效阈值，缺失时使用默认值并输出 console.warn
 */
export function resolveThresholds(thresholds?: Partial<AlertThresholds>): AlertThresholds {
  const resolved = { ...DEFAULT_THRESHOLDS };

  if (!thresholds) {
    console.warn('[alertRules] 未提供告警阈值配置，使用默认值');
    return resolved;
  }

  if (thresholds.profitMarginMin === undefined || thresholds.profitMarginMin === null) {
    console.warn('[alertRules] profitMarginMin 缺失，使用默认值:', DEFAULT_THRESHOLDS.profitMarginMin);
  } else {
    resolved.profitMarginMin = thresholds.profitMarginMin;
  }

  if (thresholds.paymentFeeChangeMax === undefined || thresholds.paymentFeeChangeMax === null) {
    console.warn('[alertRules] paymentFeeChangeMax 缺失，使用默认值:', DEFAULT_THRESHOLDS.paymentFeeChangeMax);
  } else {
    resolved.paymentFeeChangeMax = thresholds.paymentFeeChangeMax;
  }

  if (thresholds.trafficCostPerDeviceChangeMax === undefined || thresholds.trafficCostPerDeviceChangeMax === null) {
    console.warn('[alertRules] trafficCostPerDeviceChangeMax 缺失，使用默认值:', DEFAULT_THRESHOLDS.trafficCostPerDeviceChangeMax);
  } else {
    resolved.trafficCostPerDeviceChangeMax = thresholds.trafficCostPerDeviceChangeMax;
  }

  return resolved;
}

/**
 * 判定告警严重程度
 * 超阈值 2 倍以上为 'critical'，否则为 'warning'
 *
 * @param deviation - 偏离量（绝对值）
 * @param threshold - 阈值（绝对值）
 */
export function determineSeverity(deviation: number, threshold: number): 'warning' | 'critical' {
  if (threshold <= 0) return 'warning';
  return deviation >= threshold * 2 ? 'critical' : 'warning';
}

/**
 * 检查利润率告警：利润率低于阈值时生成告警
 *
 * @param profitMargin - 当前利润率（小数形式，如 0.05 = 5%）
 * @param thresholds - 阈值配置
 * @param productType - 产品类型名称（可选）
 */
export function checkProfitMarginAlert(
  profitMargin: number,
  thresholds?: Partial<AlertThresholds>,
  productType?: string,
): AlertItem | null {
  if (typeof profitMargin !== 'number' || Number.isNaN(profitMargin)) return null;

  const resolved = resolveThresholds(thresholds);
  const minThreshold = resolved.profitMarginMin;

  if (profitMargin >= minThreshold) return null;

  const deviation = minThreshold - profitMargin;

  return {
    id: `profit-margin-${productType ?? 'overall'}-${Date.now()}`,
    type: 'profitMargin',
    severity: determineSeverity(deviation, minThreshold),
    title: '利润率低于预设阈值',
    productType,
    currentValue: profitMargin,
    threshold: minThreshold,
    changePercent: undefined,
  };
}

/**
 * 检查手续费率告警：手续费率环比上升超阈值时生成告警
 *
 * @param changePercent - 手续费率环比变化（小数形式，如 0.08 = 8% 上升）
 * @param thresholds - 阈值配置
 */
export function checkPaymentFeeAlert(
  changePercent: number,
  thresholds?: Partial<AlertThresholds>,
): AlertItem | null {
  if (typeof changePercent !== 'number' || Number.isNaN(changePercent)) return null;

  const resolved = resolveThresholds(thresholds);
  const maxThreshold = resolved.paymentFeeChangeMax;

  if (changePercent <= maxThreshold) return null;

  const deviation = changePercent - maxThreshold;

  return {
    id: `payment-fee-${Date.now()}`,
    type: 'paymentFee',
    severity: determineSeverity(deviation, maxThreshold),
    title: '手续费率环比异常上升',
    currentValue: changePercent,
    threshold: maxThreshold,
    changePercent,
  };
}

/**
 * 检查流量成本告警：单设备流量成本环比上升超阈值时生成告警
 *
 * @param changePercent - 单设备流量成本环比变化（小数形式）
 * @param thresholds - 阈值配置
 * @param deviceType - 设备类型名称（可选）
 */
export function checkTrafficCostAlert(
  changePercent: number,
  thresholds?: Partial<AlertThresholds>,
  deviceType?: string,
): AlertItem | null {
  if (typeof changePercent !== 'number' || Number.isNaN(changePercent)) return null;

  const resolved = resolveThresholds(thresholds);
  const maxThreshold = resolved.trafficCostPerDeviceChangeMax;

  if (changePercent <= maxThreshold) return null;

  const deviation = changePercent - maxThreshold;

  return {
    id: `traffic-cost-${deviceType ?? 'overall'}-${Date.now()}`,
    type: 'trafficCost',
    severity: determineSeverity(deviation, maxThreshold),
    title: '单设备流量成本环比异常上升',
    deviceType,
    currentValue: changePercent,
    threshold: maxThreshold,
    changePercent,
  };
}

/**
 * 告警排序：按严重程度排序（critical 优先），同等严重程度按变化幅度降序
 */
export function sortAlerts(alerts: AlertItem[]): AlertItem[] {
  return [...alerts].sort((a, b) => {
    // critical 优先于 warning
    if (a.severity !== b.severity) {
      return a.severity === 'critical' ? -1 : 1;
    }
    // 同等严重程度按变化幅度降序（取绝对值比较）
    const aChange = Math.abs(a.changePercent ?? (a.currentValue - a.threshold));
    const bChange = Math.abs(b.changePercent ?? (b.currentValue - b.threshold));
    return bChange - aChange;
  });
}

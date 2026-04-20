export const DEVICE_THRESHOLDS = {
  onlineRate:               { yellow: 0.85 },
  churnRatio:               { red: 0.15 },
  chargingAbnormalCount:    { red: 500 },
  firstNetworkSuccessRate:  { red: 0.80 },
  finalWifiSuccessRate:     { red: 0.90 },
} as const;

export type ThresholdKey = keyof typeof DEVICE_THRESHOLDS;

export function getAlertLevel(key: ThresholdKey, value: number): 'yellow' | 'red' | null {
  const t = DEVICE_THRESHOLDS[key];
  if ('yellow' in t && value < t.yellow) return 'yellow';
  if ('red' in t) {
    // 成功率类（越低越差）：低于阈值告警；数量/占比类（越高越差）：超过阈值告警
    const isLowBad = key.includes('Rate') || key === 'onlineRate';
    if (isLowBad ? value < (t as { red: number }).red : value > (t as { red: number }).red) return 'red';
  }
  return null;
}

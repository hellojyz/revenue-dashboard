import { describe, it, expect, vi } from 'vitest';
import {
  DEFAULT_THRESHOLDS,
  resolveThresholds,
  determineSeverity,
  checkProfitMarginAlert,
  checkPaymentFeeAlert,
  checkTrafficCostAlert,
  sortAlerts,
} from './alertRules';
import type { AlertItem } from '../types/dashboard';

describe('resolveThresholds', () => {
  it('returns defaults when no thresholds provided', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = resolveThresholds();
    expect(result).toEqual(DEFAULT_THRESHOLDS);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('fills missing fields with defaults and warns', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = resolveThresholds({ profitMarginMin: 0.2 });
    expect(result.profitMarginMin).toBe(0.2);
    expect(result.paymentFeeChangeMax).toBe(DEFAULT_THRESHOLDS.paymentFeeChangeMax);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('determineSeverity', () => {
  it('returns critical when deviation >= 2x threshold', () => {
    expect(determineSeverity(0.2, 0.1)).toBe('critical');
    expect(determineSeverity(0.3, 0.1)).toBe('critical');
  });

  it('returns warning when deviation < 2x threshold', () => {
    expect(determineSeverity(0.15, 0.1)).toBe('warning');
    expect(determineSeverity(0.05, 0.1)).toBe('warning');
  });

  it('returns warning for zero threshold', () => {
    expect(determineSeverity(0.1, 0)).toBe('warning');
  });
});

describe('checkProfitMarginAlert', () => {
  it('generates alert when profit margin below threshold', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const alert = checkProfitMarginAlert(0.05, { profitMarginMin: 0.1 }, '云存');
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('profitMargin');
    expect(alert!.productType).toBe('云存');
    expect(alert!.currentValue).toBe(0.05);
    expect(alert!.threshold).toBe(0.1);
    spy.mockRestore();
  });

  it('returns null when profit margin meets threshold', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const alert = checkProfitMarginAlert(0.15, { profitMarginMin: 0.1 });
    expect(alert).toBeNull();
    spy.mockRestore();
  });

  it('returns null for NaN input', () => {
    expect(checkProfitMarginAlert(NaN)).toBeNull();
  });

  it('assigns critical severity when deviation >= 2x threshold', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // threshold=0.1, margin=-0.1, deviation=0.2 >= 0.1*2
    const alert = checkProfitMarginAlert(-0.1, { profitMarginMin: 0.1 });
    expect(alert!.severity).toBe('critical');
    spy.mockRestore();
  });
});

describe('checkPaymentFeeAlert', () => {
  it('generates alert when fee change exceeds threshold', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const alert = checkPaymentFeeAlert(0.08, { paymentFeeChangeMax: 0.05 });
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('paymentFee');
    expect(alert!.changePercent).toBe(0.08);
    spy.mockRestore();
  });

  it('returns null when fee change within threshold', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const alert = checkPaymentFeeAlert(0.03, { paymentFeeChangeMax: 0.05 });
    expect(alert).toBeNull();
    spy.mockRestore();
  });
});

describe('checkTrafficCostAlert', () => {
  it('generates alert when traffic cost change exceeds threshold', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const alert = checkTrafficCostAlert(0.15, { trafficCostPerDeviceChangeMax: 0.1 }, 'IPC');
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('trafficCost');
    expect(alert!.deviceType).toBe('IPC');
    spy.mockRestore();
  });

  it('returns null when traffic cost change within threshold', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const alert = checkTrafficCostAlert(0.05, { trafficCostPerDeviceChangeMax: 0.1 });
    expect(alert).toBeNull();
    spy.mockRestore();
  });
});

describe('sortAlerts', () => {
  it('sorts critical before warning', () => {
    const alerts: AlertItem[] = [
      { id: '1', type: 'profitMargin', severity: 'warning', title: 'A', currentValue: 0.08, threshold: 0.1 },
      { id: '2', type: 'paymentFee', severity: 'critical', title: 'B', currentValue: 0.2, threshold: 0.05, changePercent: 0.2 },
    ];
    const sorted = sortAlerts(alerts);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[1].severity).toBe('warning');
  });

  it('sorts same severity by change magnitude descending', () => {
    const alerts: AlertItem[] = [
      { id: '1', type: 'paymentFee', severity: 'warning', title: 'A', currentValue: 0.06, threshold: 0.05, changePercent: 0.06 },
      { id: '2', type: 'trafficCost', severity: 'warning', title: 'B', currentValue: 0.2, threshold: 0.1, changePercent: 0.2 },
    ];
    const sorted = sortAlerts(alerts);
    expect(sorted[0].id).toBe('2'); // larger change
    expect(sorted[1].id).toBe('1');
  });

  it('does not mutate original array', () => {
    const alerts: AlertItem[] = [
      { id: '1', type: 'profitMargin', severity: 'warning', title: 'A', currentValue: 0.08, threshold: 0.1 },
    ];
    const sorted = sortAlerts(alerts);
    expect(sorted).not.toBe(alerts);
  });
});

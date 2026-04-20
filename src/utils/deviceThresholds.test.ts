import { describe, it, expect } from 'vitest';
import { getAlertLevel } from './deviceThresholds';

describe('getAlertLevel', () => {
  describe('onlineRate (yellow threshold = 0.85)', () => {
    it('returns "yellow" when value < 0.85', () => {
      expect(getAlertLevel('onlineRate', 0.84)).toBe('yellow');
    });

    it('returns null when value === 0.85', () => {
      expect(getAlertLevel('onlineRate', 0.85)).toBeNull();
    });

    it('returns null when value > 0.85', () => {
      expect(getAlertLevel('onlineRate', 0.90)).toBeNull();
    });
  });

  describe('churnRatio (red threshold = 0.15)', () => {
    it('returns "red" when value > 0.15', () => {
      expect(getAlertLevel('churnRatio', 0.16)).toBe('red');
    });

    it('returns null when value === 0.15', () => {
      expect(getAlertLevel('churnRatio', 0.15)).toBeNull();
    });

    it('returns null when value < 0.15', () => {
      expect(getAlertLevel('churnRatio', 0.10)).toBeNull();
    });
  });

  describe('chargingAbnormalCount (red threshold = 500)', () => {
    it('returns "red" when value > 500', () => {
      expect(getAlertLevel('chargingAbnormalCount', 501)).toBe('red');
    });

    it('returns null when value === 500', () => {
      expect(getAlertLevel('chargingAbnormalCount', 500)).toBeNull();
    });

    it('returns null when value < 500', () => {
      expect(getAlertLevel('chargingAbnormalCount', 499)).toBeNull();
    });
  });

  describe('firstNetworkSuccessRate (red threshold = 0.80)', () => {
    it('returns "red" when value < 0.80', () => {
      expect(getAlertLevel('firstNetworkSuccessRate', 0.79)).toBe('red');
    });

    it('returns null when value === 0.80', () => {
      expect(getAlertLevel('firstNetworkSuccessRate', 0.80)).toBeNull();
    });
  });

  describe('finalWifiSuccessRate (red threshold = 0.90)', () => {
    it('returns "red" when value < 0.90', () => {
      expect(getAlertLevel('finalWifiSuccessRate', 0.89)).toBe('red');
    });

    it('returns null when value === 0.90', () => {
      expect(getAlertLevel('finalWifiSuccessRate', 0.90)).toBeNull();
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatChange,
  formatLargeNumber,
} from './formatters';

describe('formatCurrency', () => {
  it('formats positive amounts with ¥ prefix and comma separators', () => {
    expect(formatCurrency(1234567.89)).toBe('¥1,234,567.89');
    expect(formatCurrency(0)).toBe('¥0.00');
    expect(formatCurrency(999.5)).toBe('¥999.50');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-1234.56)).toBe('-¥1,234.56');
  });

  it('returns "--" for invalid inputs', () => {
    expect(formatCurrency(null)).toBe('--');
    expect(formatCurrency(undefined)).toBe('--');
    expect(formatCurrency(NaN)).toBe('--');
    expect(formatCurrency(Infinity)).toBe('--');
    expect(formatCurrency(-Infinity)).toBe('--');
  });
});

describe('formatPercent', () => {
  it('formats decimal to percentage with 1 decimal place', () => {
    expect(formatPercent(0.235)).toBe('23.5%');
    expect(formatPercent(0)).toBe('0.0%');
    expect(formatPercent(1)).toBe('100.0%');
    expect(formatPercent(0.5)).toBe('50.0%');
  });

  it('handles negative percentages', () => {
    expect(formatPercent(-0.123)).toBe('-12.3%');
  });

  it('returns "--" for invalid inputs', () => {
    expect(formatPercent(null)).toBe('--');
    expect(formatPercent(undefined)).toBe('--');
    expect(formatPercent(NaN)).toBe('--');
  });
});

describe('formatChange', () => {
  it('formats positive change with + prefix', () => {
    expect(formatChange(0.052)).toBe('+5.2%');
    expect(formatChange(0.1)).toBe('+10.0%');
  });

  it('formats negative change with - prefix', () => {
    expect(formatChange(-0.031)).toBe('-3.1%');
  });

  it('formats zero change without sign', () => {
    expect(formatChange(0)).toBe('0.0%');
  });

  it('returns "--" for invalid inputs', () => {
    expect(formatChange(null)).toBe('--');
    expect(formatChange(undefined)).toBe('--');
    expect(formatChange(NaN)).toBe('--');
  });
});

describe('formatLargeNumber', () => {
  it('formats numbers >= 1亿 with 亿 suffix', () => {
    expect(formatLargeNumber(1234567890)).toBe('12.35亿');
    expect(formatLargeNumber(100000000)).toBe('1.00亿');
  });

  it('formats numbers >= 1万 with 万 suffix', () => {
    expect(formatLargeNumber(12345678)).toBe('1234.57万');
    expect(formatLargeNumber(10000)).toBe('1.00万');
    expect(formatLargeNumber(56789)).toBe('5.68万');
  });

  it('formats numbers < 1万 with 2 decimal places', () => {
    expect(formatLargeNumber(9999)).toBe('9999.00');
    expect(formatLargeNumber(123.456)).toBe('123.46');
    expect(formatLargeNumber(0)).toBe('0.00');
  });

  it('handles negative large numbers', () => {
    expect(formatLargeNumber(-200000000)).toBe('-2.00亿');
    expect(formatLargeNumber(-50000)).toBe('-5.00万');
    expect(formatLargeNumber(-123)).toBe('-123.00');
  });

  it('returns "--" for invalid inputs', () => {
    expect(formatLargeNumber(null)).toBe('--');
    expect(formatLargeNumber(undefined)).toBe('--');
    expect(formatLargeNumber(NaN)).toBe('--');
  });
});

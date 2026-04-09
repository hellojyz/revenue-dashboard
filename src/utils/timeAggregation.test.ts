import { describe, it, expect } from 'vitest';
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  aggregateByWeek,
  aggregateByWeekAvg,
  aggregateByMonth,
  aggregateByMonthAvg,
  getPeriodLabel,
  getLatestPeriodSum,
  getLatestPeriodAvg,
} from './timeAggregation';

describe('getWeekStart', () => {
  it('returns Monday for a Wednesday', () => {
    // 2026-03-25 is Wednesday
    expect(getWeekStart('2026-03-25')).toBe('2026-03-23');
  });

  it('returns same day for a Monday', () => {
    expect(getWeekStart('2026-03-23')).toBe('2026-03-23');
  });

  it('returns previous Monday for a Sunday', () => {
    // 2026-03-29 is Sunday
    expect(getWeekStart('2026-03-29')).toBe('2026-03-23');
  });
});

describe('getWeekEnd', () => {
  it('returns Sunday for a Wednesday', () => {
    expect(getWeekEnd('2026-03-25')).toBe('2026-03-29');
  });

  it('returns same day for a Sunday', () => {
    expect(getWeekEnd('2026-03-29')).toBe('2026-03-29');
  });
});

describe('getMonthStart', () => {
  it('returns first day of month', () => {
    expect(getMonthStart('2026-03-25')).toBe('2026-03-01');
    expect(getMonthStart('2026-01-15')).toBe('2026-01-01');
  });
});

describe('getMonthEnd', () => {
  it('returns last day of month', () => {
    expect(getMonthEnd('2026-03-15')).toBe('2026-03-31');
    expect(getMonthEnd('2026-02-10')).toBe('2026-02-28');
  });
});

describe('aggregateByWeek', () => {
  it('aggregates daily data into weekly sums with range labels', () => {
    // Mon to Sun of same week
    const dates = ['2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29'];
    const values = [100, 200, 300, 400, 500, 600, 700];
    const result = aggregateByWeek(dates, values);
    expect(result.dates).toHaveLength(1);
    expect(result.dates[0]).toBe('03-23~03-29');
    expect(result.values[0]).toBe(2800);
    expect(result.dateRanges).toHaveLength(1);
    expect(result.dateRanges[0]).toBe('2026-03-23 ~ 2026-03-29');
  });

  it('splits across two weeks', () => {
    const dates = ['2026-03-28', '2026-03-29', '2026-03-30', '2026-03-31'];
    const values = [10, 20, 30, 40];
    const result = aggregateByWeek(dates, values);
    expect(result.dates).toHaveLength(2);
    // Week 1: Sat 03-28 + Sun 03-29
    expect(result.values[0]).toBe(30);
    // Week 2: Mon 03-30 + Tue 03-31
    expect(result.values[1]).toBe(70);
    expect(result.dateRanges).toHaveLength(2);
    expect(result.dateRanges[0]).toBe('2026-03-23 ~ 2026-03-29');
    expect(result.dateRanges[1]).toBe('2026-03-30 ~ 2026-04-05');
  });

  it('returns empty for empty input', () => {
    const result = aggregateByWeek([], []);
    expect(result.dates).toHaveLength(0);
    expect(result.values).toHaveLength(0);
    expect(result.dateRanges).toHaveLength(0);
  });
});

describe('aggregateByWeekAvg', () => {
  it('computes weekly averages', () => {
    const dates = ['2026-03-23', '2026-03-24', '2026-03-25'];
    const values = [30, 60, 90];
    const result = aggregateByWeekAvg(dates, values);
    expect(result.values[0]).toBe(60); // (30+60+90)/3
  });
});

describe('aggregateByMonth', () => {
  it('aggregates daily data into monthly sums', () => {
    const dates = ['2026-02-28', '2026-03-01', '2026-03-02'];
    const values = [100, 200, 300];
    const result = aggregateByMonth(dates, values);
    expect(result.dates).toHaveLength(2);
    expect(result.values[0]).toBe(100); // Feb
    expect(result.values[1]).toBe(500); // Mar
    expect(result.dateRanges).toHaveLength(2);
    expect(result.dateRanges[0]).toBe('2026-02-01 ~ 2026-02-28');
    expect(result.dateRanges[1]).toBe('2026-03-01 ~ 2026-03-31');
  });
});

describe('aggregateByMonthAvg', () => {
  it('computes monthly averages', () => {
    const dates = ['2026-03-01', '2026-03-02', '2026-03-03'];
    const values = [10, 20, 30];
    const result = aggregateByMonthAvg(dates, values);
    expect(result.values[0]).toBe(20); // (10+20+30)/3
  });
});

describe('getPeriodLabel', () => {
  it('returns date string for day granularity', () => {
    expect(getPeriodLabel('day', '2026-03-26')).toBe('2026-03-26');
  });

  it('returns week range for week granularity', () => {
    expect(getPeriodLabel('week', '2026-03-26')).toBe('本周累计：03-23 ~ 03-26');
  });

  it('returns month range for month granularity', () => {
    expect(getPeriodLabel('month', '2026-03-26')).toBe('本月累计：03-01 ~ 03-26');
  });
});

describe('getLatestPeriodSum', () => {
  const dates = ['2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26'];
  const values = [100, 200, 300, 400];

  it('returns last value for day granularity', () => {
    expect(getLatestPeriodSum(dates, values, 'day')).toBe(400);
  });

  it('returns week sum for week granularity', () => {
    // All 4 dates are in the same week (Mon 03-23 to Thu 03-26)
    expect(getLatestPeriodSum(dates, values, 'week')).toBe(1000);
  });

  it('returns month sum for month granularity', () => {
    expect(getLatestPeriodSum(dates, values, 'month')).toBe(1000);
  });

  it('returns 0 for empty arrays', () => {
    expect(getLatestPeriodSum([], [], 'day')).toBe(0);
  });
});

describe('getLatestPeriodAvg', () => {
  const dates = ['2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26'];
  const values = [10, 20, 30, 40];

  it('returns last value for day granularity', () => {
    expect(getLatestPeriodAvg(dates, values, 'day')).toBe(40);
  });

  it('returns week average for week granularity', () => {
    expect(getLatestPeriodAvg(dates, values, 'week')).toBe(25); // (10+20+30+40)/4
  });

  it('returns 0 for empty arrays', () => {
    expect(getLatestPeriodAvg([], [], 'month')).toBe(0);
  });
});

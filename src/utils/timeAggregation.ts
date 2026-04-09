/**
 * 时间聚合工具函数
 * 将日粒度数据按周/月聚合，支持求和与均值两种模式
 */

/** 获取日期所在周的周一（ISO 周：周一为一周起始） */
export function getWeekStart(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // 距离周一的天数
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** 获取日期所在周的周日 */
export function getWeekEnd(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const day = d.getUTCDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** 获取日期所在月的月初 */
export function getMonthStart(dateStr: string): string {
  return dateStr.slice(0, 7) + '-01';
}

/** 获取日期所在月的月末 */
export function getMonthEnd(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1], 0)); // 下月第0天 = 本月最后一天
  return d.toISOString().slice(0, 10);
}

/** 格式化日期为 MM-DD */
function toMMDD(dateStr: string): string {
  return dateStr.slice(5); // "2026-03-23" → "03-23"
}

/** 聚合结果类型 */
export interface AggregateResult {
  dates: string[];
  values: number[];
  dateRanges: string[]; // tooltip 用的完整日期范围，如 "2026-03-17 ~ 2026-03-23"
}

/** 将日粒度的 dates + values 按周聚合（求和），返回范围标签 */
export function aggregateByWeek(
  dates: string[],
  values: number[],
): AggregateResult {
  return aggregateByPeriod(dates, values, getWeekStart, 'sum');
}

/** 将日粒度的 dates + values 按周聚合（均值） */
export function aggregateByWeekAvg(
  dates: string[],
  values: number[],
): AggregateResult {
  return aggregateByPeriod(dates, values, getWeekStart, 'avg');
}

/** 将日粒度的 dates + values 按月聚合（求和），返回范围标签 */
export function aggregateByMonth(
  dates: string[],
  values: number[],
): AggregateResult {
  return aggregateByPeriod(dates, values, getMonthStart, 'sum');
}

/** 将日粒度的 dates + values 按月聚合（均值） */
export function aggregateByMonthAvg(
  dates: string[],
  values: number[],
): AggregateResult {
  return aggregateByPeriod(dates, values, getMonthStart, 'avg');
}

/** 通用聚合内核 */
function aggregateByPeriod(
  dates: string[],
  values: number[],
  getStart: (d: string) => string,
  mode: 'sum' | 'avg',
): AggregateResult {
  if (!dates.length) return { dates: [], values: [], dateRanges: [] };

  const isWeek = getStart === getWeekStart;
  const groups = new Map<string, { sum: number; count: number; minDate: string; maxDate: string }>();
  const order: string[] = [];

  for (let i = 0; i < dates.length; i++) {
    const key = getStart(dates[i]);
    const existing = groups.get(key);
    if (existing) {
      existing.sum += values[i];
      existing.count += 1;
      if (dates[i] > existing.maxDate) existing.maxDate = dates[i];
      if (dates[i] < existing.minDate) existing.minDate = dates[i];
    } else {
      groups.set(key, { sum: values[i], count: 1, minDate: dates[i], maxDate: dates[i] });
      order.push(key);
    }
  }

  const resultDates: string[] = [];
  const resultValues: number[] = [];
  const resultDateRanges: string[] = [];

  for (const key of order) {
    const g = groups.get(key)!;
    // 生成范围标签：MM-DD~MM-DD
    const label = `${toMMDD(g.minDate)}~${toMMDD(g.maxDate)}`;
    resultDates.push(label);
    resultValues.push(
      Math.round((mode === 'avg' ? g.sum / g.count : g.sum) * 100) / 100,
    );
    // 生成 tooltip 用的完整日期范围
    const periodStart = isWeek ? getWeekStart(g.minDate) : getMonthStart(g.minDate);
    const periodEnd = isWeek ? getWeekEnd(g.maxDate) : getMonthEnd(g.maxDate);
    resultDateRanges.push(`${periodStart} ~ ${periodEnd}`);
  }

  return { dates: resultDates, values: resultValues, dateRanges: resultDateRanges };
}

/**
 * 获取当前预测周期的描述文本
 * - day: 预测截止日期当天
 * - week: 预测 endDate 所在整周（周一~周日）
 * - month: 预测 endDate 所在整月（1号~月末）
 */
export function getPeriodLabel(
  granularity: 'day' | 'week' | 'month',
  endDate: string,
): string {
  if (granularity === 'day') return `预测：${endDate}`;
  if (granularity === 'week') {
    const start = getWeekStart(endDate);
    const end = getWeekEnd(endDate);
    return `预测整周：${toMMDD(start)} ~ ${toMMDD(end)}`;
  }
  const start = getMonthStart(endDate);
  const end = getMonthEnd(endDate);
  return `预测整月：${toMMDD(start)} ~ ${toMMDD(end)}`;
}

/**
 * 获取截止日期所在整周/整月的预测总值
 * - day: 返回 endDate 当天的值
 * - week: endDate 所在整周（周一~周日）所有日数据求和
 * - month: endDate 所在整月（1号~月末）所有日数据求和
 */
export function getLatestPeriodSum(
  dates: string[],
  values: number[],
  granularity: 'day' | 'week' | 'month',
): number {
  if (!dates.length) return 0;

  const endDate = dates[dates.length - 1];

  if (granularity === 'day') {
    return values[values.length - 1] ?? 0;
  }

  const periodStart = granularity === 'week' ? getWeekStart(endDate) : getMonthStart(endDate);
  const periodEnd = granularity === 'week' ? getWeekEnd(endDate) : getMonthEnd(endDate);

  let sum = 0;
  for (let i = 0; i < dates.length; i++) {
    if (dates[i] >= periodStart && dates[i] <= periodEnd) {
      sum += values[i];
    }
  }
  return Math.round(sum * 100) / 100;
}

/**
 * 获取截止日期所在整周/整月的预测均值（用于利润率等百分比指标）
 */
export function getLatestPeriodAvg(
  dates: string[],
  values: number[],
  granularity: 'day' | 'week' | 'month',
): number {
  if (!dates.length) return 0;

  const endDate = dates[dates.length - 1];

  if (granularity === 'day') {
    return values[values.length - 1] ?? 0;
  }

  const periodStart = granularity === 'week' ? getWeekStart(endDate) : getMonthStart(endDate);
  const periodEnd = granularity === 'week' ? getWeekEnd(endDate) : getMonthEnd(endDate);

  let sum = 0;
  let count = 0;
  for (let i = 0; i < dates.length; i++) {
    if (dates[i] >= periodStart && dates[i] <= periodEnd) {
      sum += values[i];
      count += 1;
    }
  }
  return count > 0 ? Math.round((sum / count) * 10000) / 10000 : 0;
}

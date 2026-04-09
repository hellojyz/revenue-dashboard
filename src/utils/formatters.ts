/**
 * 数值格式化工具函数
 * 处理金额、百分比、环比变化、大数缩写等格式化需求
 */

const FALLBACK = '--';

/**
 * 判断值是否为无效数值（null、undefined、NaN、Infinity）
 */
function isInvalidNumber(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'number') return true;
  if (Number.isNaN(value) || !Number.isFinite(value)) return true;
  return false;
}

/**
 * 金额格式化：千分位 + 2 位小数，¥前缀
 * 例：1234567.89 → "¥1,234,567.89"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (isInvalidNumber(value)) return FALLBACK;
  const num = value as number;
  const formatted = Math.abs(num)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return num < 0 ? `-¥${formatted}` : `¥${formatted}`;
}

/**
 * 百分比格式化：1 位小数 + % 后缀
 * 输入为小数形式（如 0.235 → "23.5%"）
 * 例：0.235 → "23.5%"
 */
export function formatPercent(value: number | null | undefined): string {
  if (isInvalidNumber(value)) return FALLBACK;
  const num = value as number;
  return `${(num * 100).toFixed(1)}%`;
}

/**
 * 环比变化格式化：带正负号 + 1 位小数 + %
 * 输入为小数形式（如 0.052 → "+5.2%"，-0.031 → "-3.1%"）
 */
export function formatChange(value: number | null | undefined): string {
  if (isInvalidNumber(value)) return FALLBACK;
  const num = value as number;
  const percent = (num * 100).toFixed(1);
  if (num > 0) return `+${percent}%`;
  if (num < 0) return `${percent}%`;
  return `0.0%`;
}

/**
 * 大数缩写格式化：超万显示 x.xx万，超亿显示 x.xx亿
 * 例：12345678 → "1234.57万"，1234567890 → "12.35亿"
 */
export function formatLargeNumber(value: number | null | undefined): string {
  if (isInvalidNumber(value)) return FALLBACK;
  const num = value as number;
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1e8) {
    return `${sign}${(abs / 1e8).toFixed(2)}亿`;
  }
  if (abs >= 1e4) {
    return `${sign}${(abs / 1e4).toFixed(2)}万`;
  }
  return `${sign}${abs.toFixed(2)}`;
}

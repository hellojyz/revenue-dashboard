import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { KPICardProps } from '../../types/dashboard';
import { formatChange } from '../../utils/formatters';
import styles from './KPICard.module.css';

/**
 * 判断值是否为无效数值
 */
function isInvalidValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value === 'number') {
    return Number.isNaN(value) || !Number.isFinite(value);
  }
  return false;
}

/**
 * KPICard 单个指标卡组件
 * 渲染主数值、环比变化（正值绿色上箭头、负值红色下箭头）、迷你折线图
 */
const KPICard = ({
  title,
  value,
  unit,
  changePercent,
  sparklineData,
  highlighted = false,
  subtitle,
}: KPICardProps) => {
  const displayValue = isInvalidValue(value) ? '--' : String(value);

  const changeText = isInvalidValue(changePercent) ? '--' : formatChange(changePercent);

  const changeDirection = isInvalidValue(changePercent)
    ? 'neutral'
    : (changePercent as number) > 0
      ? 'up'
      : (changePercent as number) < 0
        ? 'down'
        : 'neutral';

  const arrow =
    changeDirection === 'up' ? '↑' : changeDirection === 'down' ? '↓' : '';

  const changeClassName =
    changeDirection === 'up'
      ? styles.changeUp
      : changeDirection === 'down'
        ? styles.changeDown
        : styles.changeNeutral;

  const sparklineOption = useMemo(() => {
    const hasData =
      Array.isArray(sparklineData) &&
      sparklineData.length > 0 &&
      sparklineData.some((v) => typeof v === 'number' && Number.isFinite(v));

    if (!hasData) return null;

    const lineColor = highlighted ? '#56d364' : '#58a6ff';

    return {
      grid: { top: 2, right: 0, bottom: 2, left: 0 },
      xAxis: { type: 'category' as const, show: false, data: sparklineData.map((_, i) => i) },
      yAxis: { type: 'value' as const, show: false },
      series: [
        {
          type: 'line' as const,
          data: sparklineData,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: lineColor },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: lineColor + '33' },
                { offset: 1, color: lineColor + '05' },
              ],
            },
          },
        },
      ],
      tooltip: { show: false },
      animation: false,
    };
  }, [sparklineData, highlighted]);

  return (
    <div
      className={`${styles.card} ${highlighted ? styles.cardHighlighted : ''}`}
      data-testid="kpi-card"
    >
      <div className={styles.title}>{title}</div>
      {subtitle && (
        <div className={styles.subtitle}>{subtitle}</div>
      )}
      <div className={styles.valueRow}>
        <span
          className={`${styles.value} ${highlighted ? styles.valueHighlighted : ''}`}
          data-testid="kpi-value"
        >
          {displayValue}
        </span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      <span
        className={`${styles.change} ${changeClassName}`}
        data-testid="kpi-change"
        data-direction={changeDirection}
      >
        {arrow && <span>{arrow}</span>}
        <span>{changeText}</span>
      </span>
      {sparklineOption && (
        <div className={styles.sparkline} data-testid="kpi-sparkline">
          <ReactECharts
            option={sparklineOption}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      )}
    </div>
  );
};

export default KPICard;

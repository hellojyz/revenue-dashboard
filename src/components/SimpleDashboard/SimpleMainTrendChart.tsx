import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSimpleMainTrend } from '../../hooks/useSimpleDashboardData';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatCurrency } from '../../utils/formatters';
import { useI18n } from '../../i18n/I18nContext';
import { getCurrentLocaleLabels } from '../../i18n/I18nContext';
import styles from '../charts/ChartCard.module.css';

const COLORS = {
  orderAmount: '#e6c07b',
  meariSales: '#58a6ff',
  confirmedRev: '#3fb950',
  text: '#e6edf3',
  secondary: '#8b949e',
  border: '#30363d',
  bg: '#161b22',
};

function splitHistoryForecast(data: number[], fsi: number) {
  const history = data.map((v, i) => (i < fsi ? v : null));
  const forecast = data.map((v, i) => (i >= fsi - 1 ? v : null));
  return { history, forecast };
}

function forecastMarkLine(dates: string[], fsi: number) {
  if (fsi <= 0 || fsi >= dates.length) return undefined;
  return {
    silent: true,
    symbol: ['none', 'arrow'],
    symbolSize: [0, 8],
    lineStyle: { color: 'rgba(255,255,255,0.35)', type: [4, 4] as number[], width: 1.5 },
    label: {
      show: true,
      formatter: getCurrentLocaleLabels().historyForecastMark,
      color: 'rgba(255,255,255,0.6)',
      fontSize: 11,
      fontWeight: 500,
      position: 'insideEndTop',
      backgroundColor: 'rgba(22,27,34,0.85)',
      padding: [4, 8],
      borderRadius: 4,
    },
    data: [{ xAxis: dates[fsi] }],
  };
}

const SimpleMainTrendChart: React.FC = () => {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useSimpleMainTrend();
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);

  const option = useMemo(() => {
    if (!data?.dates?.length) return null;
    const labels = getCurrentLocaleLabels();
    const fsi = data.forecastStartIndex;
    const hasForecast = fsi != null && fsi > 0 && fsi < data.dates.length;

    const seriesDefs = [
      { name: labels.orderAmount, type: 'bar' as const, values: data.orderAmount, color: COLORS.orderAmount },
      { name: labels.meariSalesForecast2, type: 'line' as const, values: data.meariSales, color: COLORS.meariSales },
      { name: labels.confirmedRevForecast2, type: 'line' as const, values: data.confirmedRevenue, color: COLORS.confirmedRev },
    ];

    const legendNames = seriesDefs.map((s) => s.name);
    const series: Record<string, unknown>[] = [];

    for (let si = 0; si < seriesDefs.length; si++) {
      const def = seriesDefs[si];
      if (hasForecast) {
        const { history, forecast } = splitHistoryForecast(def.values, fsi!);
        const historySeries: Record<string, unknown> = {
          name: def.name,
          type: def.type,
          data: history,
          itemStyle: { color: def.color },
          ...(def.type === 'line' ? { lineStyle: { color: def.color, type: 'solid' }, smooth: true } : {}),
        };
        if (si === 0) historySeries.markLine = forecastMarkLine(data.dates, fsi!);
        series.push(historySeries);
        series.push({
          name: def.name,
          type: def.type,
          data: forecast,
          itemStyle: { color: def.color, ...(def.type === 'bar' ? { opacity: 0.45 } : {}) },
          ...(def.type === 'line' ? { lineStyle: { color: def.color, type: 'dashed' }, smooth: true } : {}),
        });
      } else {
        series.push({
          name: def.name,
          type: def.type,
          data: def.values,
          itemStyle: { color: def.color },
          ...(def.type === 'line' ? { lineStyle: { color: def.color }, smooth: true } : {}),
        });
      }
    }

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: COLORS.bg,
        borderColor: COLORS.border,
        textStyle: { color: COLORS.text, fontSize: 13 },
        formatter(params: Array<{ seriesName: string; value: number | null; marker: string; dataIndex: number; axisValue?: string }>) {
          if (!Array.isArray(params) || !params.length) return '';
          const idx = params[0].dataIndex;
          const header = `<div style="margin-bottom:4px;font-weight:bold">${data.dateRanges?.[idx] ?? params[0].axisValue ?? ''}</div>`;
          const seen = new Set<string>();
          const lines: string[] = [];
          for (const p of params) {
            if (p.value == null || seen.has(p.seriesName)) continue;
            seen.add(p.seriesName);
            lines.push(`${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}`);
          }
          return header + lines.join('<br/>');
        },
      },
      legend: { data: legendNames, textStyle: { color: COLORS.secondary }, top: 0 },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.dates,
        axisLabel: { color: COLORS.secondary, fontSize: 13 },
        axisLine: { lineStyle: { color: COLORS.border } },
      },
      yAxis: {
        type: 'value',
        name: labels.amountLabel,
        nameTextStyle: { color: COLORS.secondary, fontSize: 13 },
        axisLabel: { color: COLORS.secondary, fontSize: 13 },
        splitLine: { lineStyle: { color: COLORS.border, type: 'dashed' } },
        min: 0,
      },
      series,
    };
  }, [data]);

  const monthSubtitle = timeGranularity === 'month' ? t.monthTrendNote : null;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        {t.orderRevenueTrend}
        {monthSubtitle && (
          <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8, fontWeight: 400 }}>
            （{monthSubtitle}）
          </span>
        )}
      </div>
      {isLoading && <div className={styles.statusContainer}>{t.loading}</div>}
      {isError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{t.loadFailed}</span>
          <button className={styles.retryButton} onClick={() => refetch()}>{t.retry}</button>
        </div>
      )}
      {!isLoading && !isError && !option && <div className={styles.statusContainer}>{t.noData}</div>}
      {!isLoading && !isError && option && (
        <div className={styles.chartArea}>
          <ReactECharts option={option} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />
        </div>
      )}
    </div>
  );
};

export default SimpleMainTrendChart;

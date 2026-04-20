import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSimpleCrossPeriod } from '../../hooks/useSimpleDashboardData';
import { formatCurrency } from '../../utils/formatters';
import { useI18n } from '../../i18n/I18nContext';
import { getCurrentLocaleLabels } from '../../i18n/I18nContext';
import styles from '../charts/ChartCard.module.css';

const COLORS = {
  crossPeriod: '#d2a8ff',
  newMonthConfirmed: '#e6c07b',
  newMonthOrder: '#58a6ff',
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

const SimpleCrossPeriodChart: React.FC = () => {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useSimpleCrossPeriod();

  const option = useMemo(() => {
    if (!data?.dates?.length) return null;
    const labels = getCurrentLocaleLabels();
    const fsi = data.forecastStartIndex;
    const hasForecast = fsi != null && fsi > 0 && fsi < data.dates.length;

    const seriesDefs = [
      { name: labels.crossPeriodRevLabel, type: 'bar' as const, stack: 'revenue', values: data.crossPeriodRevenue, color: COLORS.crossPeriod, actualOnly: false },
      { name: labels.newMonthConfirmedLabel, type: 'bar' as const, stack: 'revenue', values: data.newMonthConfirmed, color: COLORS.newMonthConfirmed, actualOnly: false },
      { name: labels.newMonthOrderLabel, type: 'line' as const, stack: undefined, values: data.newMonthOrderAmount, color: COLORS.newMonthOrder, actualOnly: true },
    ];

    const legendNames = seriesDefs.map((s) => s.name);
    const series: Record<string, unknown>[] = [];

    for (let si = 0; si < seriesDefs.length; si++) {
      const def = seriesDefs[si];
      const isBar = def.type === 'bar';
      if (hasForecast) {
        const { history, forecast } = splitHistoryForecast(def.values, fsi!);
        const historySeries: Record<string, unknown> = {
          name: def.name,
          type: def.type,
          data: history,
          itemStyle: { color: def.color },
          ...(isBar && def.stack ? { stack: def.stack } : {}),
          ...(def.type === 'line' ? { lineStyle: { color: def.color, type: 'solid' }, smooth: true } : {}),
        };
        if (si === 0) historySeries.markLine = forecastMarkLine(data.dates, fsi!);
        series.push(historySeries);
        if (!def.actualOnly) {
        series.push({
          name: def.name,
          type: def.type,
          data: forecast,
          itemStyle: { color: def.color, ...(isBar ? { opacity: 0.45 } : {}) },
          ...(isBar && def.stack ? { stack: def.stack + '-forecast' } : {}),
          ...(def.type === 'line' ? { lineStyle: { color: def.color, type: 'dashed' }, smooth: true } : {}),
        });
        }
      } else {
        series.push({
          name: def.name,
          type: def.type,
          data: def.values,
          itemStyle: { color: def.color },
          ...(isBar && def.stack ? { stack: def.stack } : {}),
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
      grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
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

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>{t.crossPeriodTitle}</div>
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

export default SimpleCrossPeriodChart;

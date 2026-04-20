import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSimpleNewMonthPkg } from '../../hooks/useSimpleDashboardData';
import { formatCurrency } from '../../utils/formatters';
import { useI18n } from '../../i18n/I18nContext';
import { getCurrentLocaleLabels } from '../../i18n/I18nContext';
import styles from '../charts/ChartCard.module.css';

const C = { total: '#8b949e', yearly: '#58a6ff', yearlyConf: '#3fb950', monthly: '#e6c07b', monthlyConf: '#d2a8ff', text: '#e6edf3', sec: '#8b949e', border: '#30363d', bg: '#161b22' };

function split(data: number[], fsi: number) {
  return { history: data.map((v, i) => i < fsi ? v : null), forecast: data.map((v, i) => i >= fsi - 1 ? v : null) };
}

function markLine(dates: string[], fsi: number) {
  if (fsi <= 0 || fsi >= dates.length) return undefined;
  return { silent: true, symbol: ['none', 'arrow'], symbolSize: [0, 8], lineStyle: { color: 'rgba(255,255,255,0.35)', type: [4, 4] as number[], width: 1.5 },
    label: { show: true, formatter: getCurrentLocaleLabels().historyForecastMark, color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500, position: 'insideEndTop', backgroundColor: 'rgba(22,27,34,0.85)', padding: [4, 8], borderRadius: 4 },
    data: [{ xAxis: dates[fsi] }] };
}

function buildOption(dates: string[], dateRanges: string[] | undefined, fsi: number | undefined,
  barValues: number[], line1Values: number[], line2Values: number[],
  barName: string, line1Name: string, line2Name: string,
  barColor: string, line1Color: string, line2Color: string,
  barActualOnly = true, line1ActualOnly = true, line2ActualOnly = false) {
  const labels = getCurrentLocaleLabels();
  const hasForecast = fsi != null && fsi > 0 && fsi < dates.length;
  const defs = [
    { name: barName, type: 'bar' as const, values: barValues, color: barColor, actualOnly: barActualOnly },
    { name: line1Name, type: 'line' as const, values: line1Values, color: line1Color, actualOnly: line1ActualOnly },
    { name: line2Name, type: 'line' as const, values: line2Values, color: line2Color, actualOnly: line2ActualOnly },
  ];
  const series: Record<string, unknown>[] = [];
  for (let si = 0; si < defs.length; si++) {
    const d = defs[si];
    if (hasForecast) {
      const { history, forecast } = split(d.values, fsi!);
      const hs: Record<string, unknown> = { name: d.name, type: d.type, data: history, itemStyle: { color: d.color }, ...(d.type === 'line' ? { lineStyle: { color: d.color, type: 'solid' }, smooth: true } : {}) };
      if (si === 0) hs.markLine = markLine(dates, fsi!);
      series.push(hs);
      if (!d.actualOnly) {
        series.push({ name: d.name, type: d.type, data: forecast, itemStyle: { color: d.color, ...(d.type === 'bar' ? { opacity: 0.45 } : {}) }, ...(d.type === 'line' ? { lineStyle: { color: d.color, type: 'dashed' }, smooth: true } : {}) });
      }
    } else {
      series.push({ name: d.name, type: d.type, data: d.values, itemStyle: { color: d.color }, ...(d.type === 'line' ? { lineStyle: { color: d.color }, smooth: true } : {}) });
    }
  }
  return {
    tooltip: { trigger: 'axis', backgroundColor: C.bg, borderColor: C.border, textStyle: { color: C.text, fontSize: 13 },
      formatter(params: Array<{ seriesName: string; value: number | null; marker: string; dataIndex: number; axisValue?: string }>) {
        if (!Array.isArray(params) || !params.length) return '';
        const idx = params[0].dataIndex;
        const header = `<div style="margin-bottom:4px;font-weight:bold">${dateRanges?.[idx] ?? params[0].axisValue ?? ''}</div>`;
        const seen = new Set<string>(); const lines: string[] = [];
        for (const p of params) { if (p.value == null || seen.has(p.seriesName)) continue; seen.add(p.seriesName); lines.push(`${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}`); }
        return header + lines.join('<br/>');
      } },
    legend: { data: defs.map(d => d.name), textStyle: { color: C.sec }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: dates, axisLabel: { color: C.sec, fontSize: 12 }, axisLine: { lineStyle: { color: C.border } } },
    yAxis: { type: 'value', name: labels.amountLabel, nameTextStyle: { color: C.sec, fontSize: 13 }, axisLabel: { color: C.sec, fontSize: 13 }, splitLine: { lineStyle: { color: C.border, type: 'dashed' } }, min: 0 },
    series,
  };
}

const SimpleNewMonthPkgChart: React.FC = () => {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useSimpleNewMonthPkg();

  const yearlyOption = useMemo(() => {
    if (!data?.dates?.length) return null;
    const labels = getCurrentLocaleLabels();
    return buildOption(data.dates, data.dateRanges, data.forecastStartIndex,
      data.totalOrderAmount, data.yearlyOrderAmount, data.newMonthYearlyConfirmed,
      labels.totalOrderAmount, labels.yearlyOrderAmount, labels.yearlyNewConfirmed,
      C.total, C.yearly, C.yearlyConf);
  }, [data]);

  const monthlyOption = useMemo(() => {
    if (!data?.dates?.length) return null;
    const labels = getCurrentLocaleLabels();
    return buildOption(data.dates, data.dateRanges, data.forecastStartIndex,
      data.totalOrderAmount, data.monthlyOrderAmount, data.newMonthMonthlyConfirmed,
      labels.totalOrderAmount, labels.monthlyOrderAmount, labels.monthlyNewConfirmed,
      C.total, C.monthly, C.monthlyConf);
  }, [data]);

  if (isLoading) return <div className={styles.chartCard}><div className={styles.statusContainer}>{t.loading}</div></div>;
  if (isError) return <div className={styles.chartCard}><div className={styles.errorContainer}><span className={styles.errorText}>{t.loadFailed}</span><button className={styles.retryButton} onClick={() => refetch()}>{t.retry}</button></div></div>;
  if (!yearlyOption || !monthlyOption) return <div className={styles.chartCard}><div className={styles.statusContainer}>{t.noData}</div></div>;

  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
        <div className={styles.chartCard} style={{ flex: 1 }}>
          <div className={styles.chartTitle}>{t.yearlyPkgAnalysis}</div>
          <div className={styles.chartArea}>
            <ReactECharts option={yearlyOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>
        <div className={styles.chartCard} style={{ flex: 1 }}>
          <div className={styles.chartTitle}>{t.monthlyPkgAnalysis}</div>
          <div className={styles.chartArea}>
            <ReactECharts option={monthlyOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleNewMonthPkgChart;

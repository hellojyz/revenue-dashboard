import { useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Select } from 'antd';
import { useHeatmapStore } from '../../store/useHeatmapStore';
import { getColorLevel, getColorIntensity, DEFAULT_HEATMAP_THRESHOLDS, DEFAULT_VOLATILITY_THRESHOLDS, METRIC_LABELS, formatMetricDisplay, sortWithTieBreaking, evaluateVolatilityAlerts } from '../../utils/heatmapThresholds';
import { useI18n } from '../../i18n/I18nContext';
import type { HeatmapAppMetric, HeatmapMetricKey, HeatmapColorLevel, HeatmapSortConfig } from '../../types/heatmap';
import ErrorBoundary from '../common/ErrorBoundary';
import styles from './HeatmapChart.module.css';

const METRIC_KEYS: HeatmapMetricKey[] = ['deviceCount', 'subscriptionConversionRate', 'subscriptionRetentionRate', 'revenuePerDevice'];
const COLOR_BASE: Record<HeatmapColorLevel, [number, number, number]> = {
  critical: [255, 77, 79], warning: [250, 173, 20], normal: [82, 196, 26], excellent: [24, 144, 255],
};
function levelColor(level: HeatmapColorLevel, intensity: number): string {
  const b = COLOR_BASE[level]; const m = intensity * 0.35;
  return `rgb(${Math.round(b[0]+(255-b[0])*m)},${Math.round(b[1]+(255-b[1])*m)},${Math.round(b[2]+(255-b[2])*m)})`;
}

interface Props { data: HeatmapAppMetric[]; }

function HeatmapChartInner({ data }: Props) {
  const { t } = useI18n();
  const highlight = useHeatmapStore((s) => s.highlight);
  const sortConfig = useHeatmapStore((s) => s.sortConfig);
  const setSortConfig = useHeatmapStore((s) => s.setSortConfig);
  const toggleHighlight = useHeatmapStore((s) => s.toggleHighlight);

  const LEVEL_LABELS: Record<HeatmapColorLevel, string> = { excellent: t.excellent, normal: t.normal, warning: t.warning, critical: t.severe };
  const sortFieldOptions = useMemo(() => [
    { value: 'appName', label: t.byAppName }, { value: 'deviceCount', label: t.byDeviceCount },
    { value: 'subscriptionConversionRate', label: t.byConversionRate }, { value: 'subscriptionRetentionRate', label: t.byRetentionRate },
    { value: 'revenuePerDevice', label: t.byRevenuePerDevice },
  ], [t]);
  const METRIC_X_LABELS = useMemo(() => [t.deviceCount, t.conversionRate, t.retentionRate, t.revenuePerDevice], [t]);

  const volatilitySet = useMemo(() => {
    const alerts = evaluateVolatilityAlerts(data, DEFAULT_VOLATILITY_THRESHOLDS);
    const set = new Set<string>(); for (const a of alerts) set.add(`${a.appName}|${a.metricKey}`); return set;
  }, [data]);

  const sortedData = useMemo(() => sortWithTieBreaking(data, sortConfig), [data, sortConfig]);
  const appNames = useMemo(() => sortedData.map((d) => d.appName), [sortedData]);

  const heatmapData = useMemo(() => {
    const result: any[] = [];
    sortedData.forEach((app, yIdx) => {
      METRIC_KEYS.forEach((key, xIdx) => {
        const val = app[key]; const appName = app.appName;
        const isHl = highlight?.appName === appName && (!highlight.metricKey || highlight.metricKey === key);
        const hasVol = volatilitySet.has(`${appName}|${key}`);
        let color = '#f0f0f0';
        if (val !== null && val !== undefined) { const lv = getColorLevel(val, key, DEFAULT_HEATMAP_THRESHOLDS); color = levelColor(lv, getColorIntensity(val, key, DEFAULT_HEATMAP_THRESHOLDS)); }
        let borderColor = '#fff'; let borderWidth = 1;
        if (isHl) { borderColor = '#1677ff'; borderWidth = 3; } else if (hasVol) { borderColor = '#722ed1'; borderWidth = 2; }
        result.push({ value: [xIdx, yIdx, val], itemStyle: { color, borderColor, borderWidth } });
      });
    }); return result;
  }, [sortedData, highlight, volatilitySet]);

  const chartHeight = Math.max(300, appNames.length * 36 + 80);
  const handleSortField = useCallback((field: string) => {
    setSortConfig({ field: field as HeatmapSortConfig['field'], order: field === sortConfig.field && sortConfig.order === 'desc' ? 'asc' : 'desc' });
  }, [sortConfig, setSortConfig]);

  const option = useMemo(() => ({
    tooltip: { formatter: (p: any) => {
      const [xi, yi] = p.value; const app = sortedData[yi]; const mk = METRIC_KEYS[xi]; const val = app[mk];
      if (val == null) return `${appNames[yi]}<br/>${METRIC_LABELS[mk]}: --`;
      const lv = getColorLevel(val, mk, DEFAULT_HEATMAP_THRESHOLDS);
      return `${appNames[yi]}<br/>${METRIC_LABELS[mk]}: ${formatMetricDisplay(val, mk)}<br/>${LEVEL_LABELS[lv]}`;
    }},
    grid: { left: 140, right: 20, top: 30, bottom: 20 },
    xAxis: { type: 'category', data: METRIC_X_LABELS, position: 'top', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 12, color: '#666' } },
    yAxis: { type: 'category', data: appNames, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 12, color: '#333', width: 120, overflow: 'truncate' } },
    series: [{ type: 'heatmap', data: heatmapData, label: { show: false }, emphasis: { itemStyle: { borderColor: '#1677ff', borderWidth: 2 } } }],
  }), [appNames, heatmapData, sortedData, METRIC_X_LABELS, LEVEL_LABELS]);

  const onChartClick = useCallback((p: any) => {
    if (p.componentType === 'series') { const [xi, yi] = p.value; toggleHighlight({ appName: appNames[yi], metricKey: METRIC_KEYS[xi] }); }
  }, [appNames, toggleHighlight]);
  const onEvents = useMemo(() => ({ click: onChartClick }), [onChartClick]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{t.heatmapChartTitle}</span>
        <div className={styles.sortControls}>
          <span style={{ fontSize: 12, color: '#999', marginRight: 16 }}>
            {t.colorScale}：<span style={{ color: '#1890ff' }}>■</span>{t.excellent}
            <span style={{ color: '#52c41a', marginLeft: 6 }}>■</span>{t.normal}
            <span style={{ color: '#faad14', marginLeft: 6 }}>■</span>{t.warning}
            <span style={{ color: '#ff4d4f', marginLeft: 6 }}>■</span>{t.severe}
          </span>
          <span>{t.sortBy}：</span>
          <Select value={sortConfig.field} onChange={handleSortField} options={sortFieldOptions} size="small" style={{ width: 150 }} />
        </div>
      </div>
      <div className={styles.chartWrapper} style={{ maxHeight: 500, overflowY: 'auto' }}>
        <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} onEvents={onEvents} notMerge />
      </div>
    </div>
  );
}

export default function HeatmapChart(props: Props) {
  return <ErrorBoundary><HeatmapChartInner {...props} /></ErrorBoundary>;
}

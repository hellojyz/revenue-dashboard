import { useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Select } from 'antd';
import { useHeatmapStore } from '../../store/useHeatmapStore';
import {
  getColorLevel,
  getColorIntensity,
  DEFAULT_HEATMAP_THRESHOLDS,
  DEFAULT_VOLATILITY_THRESHOLDS,
  METRIC_LABELS,
  formatMetricDisplay,
  sortWithTieBreaking,
  evaluateVolatilityAlerts,
} from '../../utils/heatmapThresholds';
import type {
  HeatmapAppMetric,
  HeatmapMetricKey,
  HeatmapColorLevel,
  HeatmapSortConfig,
} from '../../types/heatmap';
import ErrorBoundary from '../common/ErrorBoundary';
import styles from './HeatmapChart.module.css';

const METRIC_KEYS: HeatmapMetricKey[] = [
  'deviceCount',
  'subscriptionConversionRate',
  'subscriptionRetentionRate',
  'revenuePerDevice',
];

const METRIC_X_LABELS = METRIC_KEYS.map((k) => METRIC_LABELS[k]);

/** Color palette per level with intensity support */
const COLOR_MAP: Record<HeatmapColorLevel, { base: [number, number, number]; range: number }> = {
  critical: { base: [255, 77, 79], range: 40 },
  warning: { base: [250, 173, 20], range: 40 },
  normal: { base: [82, 196, 26], range: 40 },
  excellent: { base: [24, 144, 255], range: 40 },
};

const LEVEL_LABELS: Record<HeatmapColorLevel, string> = {
  excellent: '优秀',
  normal: '正常',
  warning: '预警',
  critical: '严重',
};

const sortFieldOptions = [
  { value: 'appName', label: '按APP名称' },
  { value: 'deviceCount', label: '按设备数' },
  { value: 'subscriptionConversionRate', label: '按转化率' },
  { value: 'subscriptionRetentionRate', label: '按留存率' },
  { value: 'revenuePerDevice', label: '按单设备收益' },
];

interface Props {
  data: HeatmapAppMetric[];
}

function HeatmapChartInner({ data }: Props) {
  const highlight = useHeatmapStore((s) => s.highlight);
  const sortConfig = useHeatmapStore((s) => s.sortConfig);
  const setSortConfig = useHeatmapStore((s) => s.setSortConfig);
  const toggleHighlight = useHeatmapStore((s) => s.toggleHighlight);

  // Volatility set for border marking
  const volatilitySet = useMemo(() => {
    const alerts = evaluateVolatilityAlerts(data, DEFAULT_VOLATILITY_THRESHOLDS);
    const set = new Set<string>();
    for (const a of alerts) set.add(`${a.appName}|${a.metricKey}`);
    return set;
  }, [data]);

  const sortedData = useMemo(
    () => sortWithTieBreaking(data, sortConfig),
    [data, sortConfig],
  );

  const appNames = useMemo(() => sortedData.map((d) => d.appName), [sortedData]);

  const heatmapData = useMemo(() => {
    const result: Array<[number, number, number | null, string | null, number]> = [];
    sortedData.forEach((app, yIdx) => {
      METRIC_KEYS.forEach((key, xIdx) => {
        const val = app[key];
        if (val === null || val === undefined) {
          result.push([xIdx, yIdx, null, null, 0]);
        } else {
          const level = getColorLevel(val, key, DEFAULT_HEATMAP_THRESHOLDS);
          const intensity = getColorIntensity(val, key, DEFAULT_HEATMAP_THRESHOLDS);
          result.push([xIdx, yIdx, val, level, intensity]);
        }
      });
    });
    return result;
  }, [sortedData]);

  const chartHeight = Math.max(300, appNames.length * 36 + 80);

  const handleSortField = useCallback(
    (field: string) => {
      setSortConfig({
        field: field as HeatmapSortConfig['field'],
        order: field === sortConfig.field && sortConfig.order === 'desc' ? 'asc' : 'desc',
      });
    },
    [sortConfig, setSortConfig],
  );

  const option = useMemo(() => ({
    tooltip: {
      formatter: (params: any) => {
        const [xIdx, yIdx] = params.data;
        const appName = appNames[yIdx];
        const metricKey = METRIC_KEYS[xIdx];
        const app = sortedData[yIdx];
        const val = app[metricKey];
        if (val === null || val === undefined) {
          return `${appName}<br/>${METRIC_LABELS[metricKey]}: --`;
        }
        const level = getColorLevel(val, metricKey, DEFAULT_HEATMAP_THRESHOLDS);
        return `${appName}<br/>${METRIC_LABELS[metricKey]}: ${formatMetricDisplay(val, metricKey)}<br/>状态: ${LEVEL_LABELS[level]}`;
      },
    },
    grid: {
      left: 140,
      right: 20,
      top: 30,
      bottom: 20,
    },
    xAxis: {
      type: 'category',
      data: METRIC_X_LABELS,
      position: 'top',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#666' },
    },
    yAxis: {
      type: 'category',
      data: appNames,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#333', width: 120, overflow: 'truncate' },
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        emphasis: {
          itemStyle: { borderColor: '#1677ff', borderWidth: 2 },
        },
        itemStyle: {
          color: (params: any) => {
            const [xIdx, yIdx] = params.data;
            const app = sortedData[yIdx];
            const metricKey = METRIC_KEYS[xIdx];
            const val = app[metricKey];
            if (val === null || val === undefined) return '#f0f0f0';
            const level = getColorLevel(val, metricKey, DEFAULT_HEATMAP_THRESHOLDS);
            const intensity = getColorIntensity(val, metricKey, DEFAULT_HEATMAP_THRESHOLDS);
            const { base, range } = COLOR_MAP[level];
            return `rgb(${Math.min(255, base[0] + Math.round(range * (1 - intensity)))}, ${Math.min(255, base[1] + Math.round(range * (1 - intensity)))}, ${Math.min(255, base[2] + Math.round(range * (1 - intensity)))})`;
          },
          borderColor: (params: any) => {
            const [xIdx, yIdx] = params.data;
            const appName = appNames[yIdx];
            const metricKey = METRIC_KEYS[xIdx];
            // Highlight border
            if (highlight?.appName === appName && (!highlight.metricKey || highlight.metricKey === metricKey)) {
              return '#1677ff';
            }
            // Volatility border
            if (volatilitySet.has(`${appName}|${metricKey}`)) {
              return '#722ed1';
            }
            return '#fff';
          },
          borderWidth: (params: any) => {
            const [xIdx, yIdx] = params.data;
            const appName = appNames[yIdx];
            const metricKey = METRIC_KEYS[xIdx];
            if (highlight?.appName === appName && (!highlight.metricKey || highlight.metricKey === metricKey)) {
              return 3;
            }
            if (volatilitySet.has(`${appName}|${metricKey}`)) {
              return 2;
            }
            return 1;
          },
        },
        label: { show: false },
      },
    ],
  }), [appNames, heatmapData, sortedData, highlight, volatilitySet]);

  const onChartClick = useCallback(
    (params: any) => {
      if (params.componentType === 'series') {
        const [xIdx, yIdx] = params.data;
        const appName = appNames[yIdx];
        const metricKey = METRIC_KEYS[xIdx];
        toggleHighlight({ appName, metricKey });
      }
    },
    [appNames, toggleHighlight],
  );

  const onEvents = useMemo(() => ({ click: onChartClick }), [onChartClick]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>APP×指标交叉热力图</span>
        <div className={styles.sortControls}>
          <span>排序：</span>
          <Select
            value={sortConfig.field}
            onChange={handleSortField}
            options={sortFieldOptions}
            size="small"
            style={{ width: 140 }}
          />
        </div>
      </div>
      <div className={styles.chartWrapper} style={{ maxHeight: 500, overflowY: 'auto' }}>
        <ReactECharts
          option={option}
          style={{ height: chartHeight, width: '100%' }}
          onEvents={onEvents}
          notMerge
        />
      </div>
    </div>
  );
}

export default function HeatmapChart(props: Props) {
  return (
    <ErrorBoundary>
      <HeatmapChartInner {...props} />
    </ErrorBoundary>
  );
}

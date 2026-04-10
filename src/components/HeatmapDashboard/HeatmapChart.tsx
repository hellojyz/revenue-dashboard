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

const COLOR_BASE: Record<HeatmapColorLevel, [number, number, number]> = {
  critical: [255, 77, 79],
  warning: [250, 173, 20],
  normal: [82, 196, 26],
  excellent: [24, 144, 255],
};

function levelColor(level: HeatmapColorLevel, intensity: number): string {
  const base = COLOR_BASE[level];
  // intensity 0→deep, 1→light; mix with white for lighter
  const mix = intensity * 0.35;
  const r = Math.round(base[0] + (255 - base[0]) * mix);
  const g = Math.round(base[1] + (255 - base[1]) * mix);
  const b = Math.round(base[2] + (255 - base[2]) * mix);
  return `rgb(${r},${g},${b})`;
}

const LEVEL_LABELS: Record<HeatmapColorLevel, string> = {
  excellent: '优秀', normal: '正常', warning: '预警', critical: '严重',
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

  const volatilitySet = useMemo(() => {
    const alerts = evaluateVolatilityAlerts(data, DEFAULT_VOLATILITY_THRESHOLDS);
    const set = new Set<string>();
    for (const a of alerts) set.add(`${a.appName}|${a.metricKey}`);
    return set;
  }, [data]);

  const sortedData = useMemo(() => sortWithTieBreaking(data, sortConfig), [data, sortConfig]);
  const appNames = useMemo(() => sortedData.map((d) => d.appName), [sortedData]);

  // Pre-compute data with per-item styles
  const heatmapData = useMemo(() => {
    const result: any[] = [];
    sortedData.forEach((app, yIdx) => {
      METRIC_KEYS.forEach((key, xIdx) => {
        const val = app[key];
        const appName = app.appName;
        const isHighlighted =
          highlight?.appName === appName &&
          (!highlight.metricKey || highlight.metricKey === key);
        const hasVolatility = volatilitySet.has(`${appName}|${key}`);

        let color = '#f0f0f0';
        if (val !== null && val !== undefined) {
          const level = getColorLevel(val, key, DEFAULT_HEATMAP_THRESHOLDS);
          const intensity = getColorIntensity(val, key, DEFAULT_HEATMAP_THRESHOLDS);
          color = levelColor(level, intensity);
        }

        let borderColor = '#fff';
        let borderWidth = 1;
        if (isHighlighted) {
          borderColor = '#1677ff';
          borderWidth = 3;
        } else if (hasVolatility) {
          borderColor = '#722ed1';
          borderWidth = 2;
        }

        result.push({
          value: [xIdx, yIdx, val],
          itemStyle: { color, borderColor, borderWidth },
        });
      });
    });
    return result;
  }, [sortedData, highlight, volatilitySet]);

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
        const [xIdx, yIdx] = params.value;
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
    grid: { left: 140, right: 20, top: 30, bottom: 20 },
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
        label: { show: false },
        emphasis: {
          itemStyle: { borderColor: '#1677ff', borderWidth: 2 },
        },
      },
    ],
  }), [appNames, heatmapData, sortedData]);

  const onChartClick = useCallback(
    (params: any) => {
      if (params.componentType === 'series') {
        const [xIdx, yIdx] = params.value;
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
          <span style={{ fontSize: 12, color: '#999', marginRight: 16 }}>
            色阶：<span style={{ color: '#1890ff' }}>■</span>优秀
            <span style={{ color: '#52c41a', marginLeft: 6 }}>■</span>正常
            <span style={{ color: '#faad14', marginLeft: 6 }}>■</span>预警
            <span style={{ color: '#ff4d4f', marginLeft: 6 }}>■</span>严重
          </span>
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

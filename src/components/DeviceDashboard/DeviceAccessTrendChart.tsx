import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Radio } from 'antd';
import { useDeviceTrendData } from '../../hooks/useDeviceData';
import { useDeviceStore } from '../../store/useDeviceStore';
import { DEVICE_THRESHOLDS } from '../../utils/deviceThresholds';
import { mockPreviewDuration } from '../../api/deviceMockData';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import styles from './TrendChart.module.css';

interface Props {
  chartId: string;
  isHighlighted?: boolean;
}

type Granularity = 'day' | 'week' | 'month';
type NetworkType = 'all' | '4g' | 'non4g';

// 模拟4G/非4G的预览时长分布差异
const previewDurationByNetwork: Record<NetworkType, { label: string; count: number }[]> = {
  all: mockPreviewDuration.buckets,
  '4g': [
    { label: '0-5s',   count: 62000 },
    { label: '5-15s',  count: 98000 },
    { label: '15-30s', count: 41000 },
    { label: '30s以上', count: 18000 },
  ],
  non4g: [
    { label: '0-5s',   count: 123000 },
    { label: '5-15s',  count: 214000 },
    { label: '15-30s', count: 107000 },
    { label: '30s以上', count: 63000 },
  ],
};

export default function DeviceAccessTrendChart({ chartId, isHighlighted }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [networkType, setNetworkType] = useState<NetworkType>('all');
  const { data, isLoading } = useDeviceTrendData();
  const setDrillDownPoint = useDeviceStore((s) => s.setDrillDownPoint);

  if (isLoading) return <LoadingState rows={3} />;

  const points = data?.access.points ?? [];
  if (points.length === 0) return <EmptyState />;

  const firstNetThreshold = DEVICE_THRESHOLDS.firstNetworkSuccessRate.red;
  const wifiThreshold = DEVICE_THRESHOLDS.finalWifiSuccessRate.red;

  const firstNetMarkPoints = points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => typeof p.firstNetworkSuccessRate === 'number' && (p.firstNetworkSuccessRate as number) < firstNetThreshold)
    .map(({ i }) => ({
      coord: [i, points[i].firstNetworkSuccessRate],
      itemStyle: { color: '#f85149' },
      symbol: 'circle',
      symbolSize: 10,
    }));

  const wifiMarkPoints = points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => typeof p.finalWifiSuccessRate === 'number' && (p.finalWifiSuccessRate as number) < wifiThreshold)
    .map(({ i }) => ({
      coord: [i, points[i].finalWifiSuccessRate],
      itemStyle: { color: '#f85149' },
      symbol: 'circle',
      symbolSize: 10,
    }));

  // 子图1：联网状态监控（双轴）
  const networkOption = {
    grid: { top: 48, right: 80, bottom: 48, left: 64 },
    legend: { top: 8, right: 0, data: ['首次配网成功率', 'WiFi配网成功率', 'SD卡丢失设备数'], textStyle: { fontSize: 10 } },
    xAxis: {
      type: 'category' as const,
      data: points.map((p) => p.period),
      axisLabel: {
        formatter: (v: string) => {
          const parts = v.split('-');
          return parts[1] ? `${parts[1]}月` : v;
        },
        rotate: 30,
        fontSize: 11,
      },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '成功率',
        min: 0,
        max: 1,
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%`, fontSize: 10 },
        nameTextStyle: { fontSize: 11 },
      },
      {
        type: 'value' as const,
        name: 'SD卡丢失数',
        position: 'right' as const,
        nameTextStyle: { fontSize: 11 },
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0;
        const pt = points[idx];
        const lines = [`${pt.period}（${pt.dateRange}）`];
        params.forEach((p) => {
          const isRate = p.seriesName.includes('率');
          const val = isRate ? `${((p.value as number) * 100).toFixed(1)}%` : String(p.value);
          lines.push(`${p.seriesName}：${val}`);
        });
        return lines.join('<br/>');
      },
    },
    series: [
      {
        name: '首次配网成功率',
        type: 'line' as const,
        yAxisIndex: 0,
        data: points.map((p) => p.firstNetworkSuccessRate),
        smooth: true,
        color: '#3fb950',
        markPoint: { data: firstNetMarkPoints },
      },
      {
        name: 'WiFi配网成功率',
        type: 'line' as const,
        yAxisIndex: 0,
        data: points.map((p) => p.finalWifiSuccessRate),
        smooth: true,
        color: '#58a6ff',
        markPoint: { data: wifiMarkPoints },
      },
      {
        name: 'SD卡丢失设备数',
        type: 'bar' as const,
        yAxisIndex: 1,
        data: points.map((p) => p.sdCardLossCount),
        color: '#f85149',
        barMaxWidth: 16,
      },
    ],
  };

  // 子图2：设备预览时长分布（柱状图）
  const currentBuckets = previewDurationByNetwork[networkType];
  const previewOption = {
    grid: { top: 16, right: 24, bottom: 36, left: 72 },
    xAxis: {
      type: 'category' as const,
      data: currentBuckets.map((b) => b.label),
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value' as const,
      name: '设备数',
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v),
        fontSize: 10,
      },
      nameTextStyle: { fontSize: 11 },
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const p = params[0];
        const val = p.value as number;
        return `${p.name}：${val >= 10000 ? `${(val / 10000).toFixed(1)}万` : val}台`;
      },
    },
    series: [{
      type: 'bar' as const,
      data: currentBuckets.map((b) => b.count),
      barMaxWidth: 40,
      itemStyle: { color: '#bc8cff' },
      label: {
        show: true,
        position: 'top' as const,
        formatter: (p: any) => {
          const v = p.value as number;
          return v >= 10000 ? `${(v / 10000).toFixed(1)}万` : String(v);
        },
        fontSize: 11,
      },
    }],
  };

  const handleClick = (params: any) => {
    const period = points[params.dataIndex]?.period;
    if (period) setDrillDownPoint(period);
  };

  return (
    <div
      className={`${styles.chartCard} ${isHighlighted ? styles.highlighted : ''}`}
      data-chart-id={chartId}
    >
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>接入与体验健康</div>
        <div className={styles.chartControls}>
          <Radio.Group
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            size="small"
            optionType="button"
            buttonStyle="solid"
            options={[
              { value: 'day', label: '日' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
            ]}
          />
          <Radio.Group
            value={networkType}
            onChange={(e) => setNetworkType(e.target.value)}
            size="small"
            optionType="button"
            buttonStyle="solid"
            options={[
              { value: 'all', label: '全部' },
              { value: '4g', label: '4G' },
              { value: 'non4g', label: '非4G' },
            ]}
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6, fontWeight: 500 }}>联网状态监控</div>
          <ReactECharts
            option={networkOption}
            style={{ height: 240, width: '100%' }}
            onEvents={{ click: handleClick }}
            opts={{ renderer: 'svg' }}
          />
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6, fontWeight: 500 }}>设备预览时长分布</div>
          <ReactECharts option={previewOption} style={{ height: 240, width: '100%' }} opts={{ renderer: 'svg' }} />
        </div>
      </div>
    </div>
  );
}

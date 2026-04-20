import ReactECharts from 'echarts-for-react';
import { Radio } from 'antd';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useDeviceDistributionData } from '../../hooks/useDeviceData';
import { formatLargeNumber } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import type { DistributionDimension } from '../../types/deviceDashboard';
import styles from './DeviceDistributionChart.module.css';

const DIMENSION_OPTIONS: { value: DistributionDimension; label: string }[] = [
  { value: 'model',     label: '机型' },
  { value: 'region',    label: '区域' },
  { value: 'channel',   label: '渠道' },
  { value: 'lifecycle', label: '生命周期' },
];

export default function DeviceDistributionChart() {
  const dimension = useDeviceStore((s) => s.distributionDimension);
  const setDistributionDimension = useDeviceStore((s) => s.setDistributionDimension);
  const drillDownPoint = useDeviceStore((s) => s.drillDownPoint);
  const { data, isLoading } = useDeviceDistributionData(dimension);

  if (isLoading) return <LoadingState rows={4} />;

  const items = data?.items ?? [];
  if (items.length === 0) return <EmptyState />;

  // 当 drillDownPoint 不为空时，高亮前2项（占比最高的）
  const sortedByRatio = [...items].sort((a, b) => b.ratio - a.ratio);
  const top2Labels = drillDownPoint
    ? new Set(sortedByRatio.slice(0, 2).map((i) => i.label))
    : new Set<string>();

  const option = {
    grid: { top: 20, right: 120, bottom: 20, left: 100 },
    xAxis: {
      type: 'value' as const,
      axisLabel: { formatter: (v: number) => formatLargeNumber(v) },
    },
    yAxis: {
      type: 'category' as const,
      data: items.map((i) => i.label),
    },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: any[]) => {
        const p = params[0];
        const item = items[p.dataIndex];
        return `${item.label}<br/>数量：${formatLargeNumber(item.value)}<br/>占比：${(item.ratio * 100).toFixed(1)}%`;
      },
    },
    series: [
      {
        type: 'bar' as const,
        data: items.map((item) => ({
          value: item.value,
          itemStyle: {
            color: drillDownPoint && top2Labels.has(item.label) ? '#f85149' : '#58a6ff',
            opacity: drillDownPoint && !top2Labels.has(item.label) ? 0.4 : 1,
          },
        })),
        label: {
          show: true,
          position: 'right' as const,
          formatter: (p: any) => `${(items[p.dataIndex].ratio * 100).toFixed(1)}%`,
        },
      },
    ],
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>设备结构分布</span>
        <Radio.Group
          value={dimension}
          onChange={(e) => setDistributionDimension(e.target.value)}
          size="small"
          optionType="button"
          buttonStyle="solid"
          options={DIMENSION_OPTIONS}
        />
      </div>
      <ReactECharts
        option={option}
        style={{ height: 280 }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}

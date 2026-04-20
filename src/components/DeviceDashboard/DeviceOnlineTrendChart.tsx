import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Radio } from 'antd';
import { useDeviceTrendData } from '../../hooks/useDeviceData';
import { useDeviceStore } from '../../store/useDeviceStore';
import { DEVICE_THRESHOLDS } from '../../utils/deviceThresholds';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import styles from './TrendChart.module.css';

interface Props {
  chartId: string;
  isHighlighted?: boolean;
}

type Granularity = 'day' | 'week' | 'month';

export default function DeviceOnlineTrendChart({ chartId, isHighlighted }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const { data, isLoading } = useDeviceTrendData();
  const setDrillDownPoint = useDeviceStore((s) => s.setDrillDownPoint);

  if (isLoading) return <LoadingState rows={3} />;

  const points = data?.online.points ?? [];
  if (points.length === 0) return <EmptyState />;

  const threshold = DEVICE_THRESHOLDS.onlineRate.yellow;

  const markPoints = points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => typeof p.onlineRate === 'number' && (p.onlineRate as number) < threshold)
    .map(({ i }) => ({
      coord: [i, points[i].onlineRate],
      itemStyle: { color: '#ffd700' },
      symbol: 'circle',
      symbolSize: 10,
    }));

  const option = {
    grid: { top: 40, right: 70, bottom: 60, left: 60 },
    legend: { top: 8, data: ['在线率', '离线率', '频繁上下线设备数'] },
    xAxis: {
      type: 'category' as const,
      data: points.map((p) => p.period),
      axisLabel: {
        formatter: (v: string) => {
          const parts = v.split('-');
          return parts[1] ? `${parts[1]}月` : v;
        },
        rotate: 30,
      },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '比率',
        min: 0,
        max: 1,
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      },
      {
        type: 'value' as const,
        name: '设备数',
        position: 'right' as const,
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0;
        const pt = points[idx];
        const lines = [`${pt.period}（${pt.dateRange}）`];
        params.forEach((p) => {
          const val = p.seriesName.includes('率')
            ? `${((p.value as number) * 100).toFixed(1)}%`
            : String(p.value);
          lines.push(`${p.seriesName}：${val}`);
        });
        return lines.join('<br/>');
      },
    },
    series: [
      {
        name: '在线率',
        type: 'line' as const,
        yAxisIndex: 0,
        data: points.map((p) => p.onlineRate),
        smooth: true,
        color: '#3fb950',
        markPoint: { data: markPoints },
      },
      {
        name: '离线率',
        type: 'line' as const,
        yAxisIndex: 0,
        data: points.map((p) => p.offlineRate),
        smooth: true,
        color: '#f85149',
      },
      {
        name: '频繁上下线设备数',
        type: 'bar' as const,
        yAxisIndex: 1,
        data: points.map((p) => p.frequentOfflineCount),
        color: '#e3b341',
        barMaxWidth: 20,
      },
    ],
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
      <div className={styles.chartTitle}>在线稳定性趋势</div>
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
      </div>
      <ReactECharts
        option={option}
        style={{ height: 280 }}
        onEvents={{ click: handleClick }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}

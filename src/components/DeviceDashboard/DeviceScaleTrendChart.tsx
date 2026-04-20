import ReactECharts from 'echarts-for-react';
import { useDeviceTrendData } from '../../hooks/useDeviceData';
import { useDeviceStore } from '../../store/useDeviceStore';
import { formatLargeNumber } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import styles from './TrendChart.module.css';

interface Props {
  chartId: string;
  isHighlighted?: boolean;
}

export default function DeviceScaleTrendChart({ chartId, isHighlighted }: Props) {
  const { data, isLoading } = useDeviceTrendData();
  const setDrillDownPoint = useDeviceStore((s) => s.setDrillDownPoint);
  const drillDownPoint = useDeviceStore((s) => s.drillDownPoint);

  if (isLoading) return <LoadingState rows={3} />;

  const points = data?.scale.points ?? [];
  if (points.length === 0) return <EmptyState />;

  const option = {
    grid: { top: 40, right: 20, bottom: 60, left: 70 },
    legend: { top: 8, data: ['设备总数', '激活设备数', '活跃设备数'] },
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
    yAxis: {
      type: 'value' as const,
      axisLabel: { formatter: (v: number) => formatLargeNumber(v) },
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0;
        const pt = points[idx];
        const lines = [`${pt.period}（${pt.dateRange}）`];
        params.forEach((p) => {
          lines.push(`${p.seriesName}：${formatLargeNumber(p.value)}`);
        });
        return lines.join('<br/>');
      },
    },
    series: [
      {
        name: '设备总数',
        type: 'line' as const,
        data: points.map((p) => p.totalDevices),
        smooth: true,
        color: '#58a6ff',
        symbol: 'circle',
        symbolSize: (val: number, params: any) =>
          points[params.dataIndex]?.period === drillDownPoint ? 10 : 4,
        itemStyle: {
          color: (params: any) =>
            points[params.dataIndex]?.period === drillDownPoint ? '#ffd700' : '#58a6ff',
        },
      },
      {
        name: '激活设备数',
        type: 'line' as const,
        data: points.map((p) => p.activatedDevices),
        smooth: true,
        color: '#3fb950',
      },
      {
        name: '活跃设备数',
        type: 'line' as const,
        data: points.map((p) => p.activeDevices),
        smooth: true,
        color: '#bc8cff',
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
      <div className={styles.chartTitle}>规模-激活-活跃趋势</div>
      <ReactECharts
        option={option}
        style={{ height: 280 }}
        onEvents={{ click: handleClick }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}

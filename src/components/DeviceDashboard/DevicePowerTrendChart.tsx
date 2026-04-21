import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Radio } from 'antd';
import { useDeviceTrendData } from '../../hooks/useDeviceData';
import { useDeviceStore } from '../../store/useDeviceStore';
import { getAlertLevel } from '../../utils/deviceThresholds';
import { mockPowerDistribution } from '../../api/deviceMockData';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import styles from './TrendChart.module.css';

interface Props {
  chartId: string;
  isHighlighted?: boolean;
}

type Granularity = 'day' | 'week' | 'month';

export default function DevicePowerTrendChart({ chartId, isHighlighted }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const { data, isLoading } = useDeviceTrendData();
  const setDrillDownPoint = useDeviceStore((s) => s.setDrillDownPoint);

  if (isLoading) return <LoadingState rows={3} />;

  const points = data?.power.points ?? [];
  if (points.length === 0) return <EmptyState />;

  // 子图1：日耗电量分布（柱状图，静态分布数据）
  const distOption = {
    grid: { top: 30, right: 20, bottom: 40, left: 60 },
    title: { text: '日耗电量分布', textStyle: { fontSize: 12, color: '#8b949e' }, left: 0, top: 4 },
    xAxis: {
      type: 'category' as const,
      data: mockPowerDistribution.buckets.map((b) => b.label),
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value' as const,
      name: '设备占比(%)',
      axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const p = params[0];
        return `${p.name}：${((p.value as number) * 100).toFixed(1)}%`;
      },
    },
    series: [{
      type: 'bar' as const,
      data: mockPowerDistribution.buckets.map((b) => b.ratio),
      barMaxWidth: 40,
      itemStyle: { color: '#58a6ff' },
      label: {
        show: true,
        position: 'top' as const,
        formatter: (p: any) => `${((p.value as number) * 100).toFixed(1)}%`,
        fontSize: 11,
      },
    }],
  };

  // 子图2：充电异常设备数 + 高耗电占比（双轴折线/柱线）
  const trendOption = {
    grid: { top: 30, right: 70, bottom: 40, left: 60 },
    title: { text: '充电异常 & 高耗电占比', textStyle: { fontSize: 12, color: '#8b949e' }, left: 0, top: 4 },
    legend: { top: 4, right: 0, data: ['充电异常设备数', '高耗电占比'], textStyle: { fontSize: 11 } },
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
        name: '充电异常数',
        position: 'left' as const,
        nameTextStyle: { fontSize: 11 },
      },
      {
        type: 'value' as const,
        name: '高耗电占比(%)',
        position: 'right' as const,
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
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
          const isRatio = p.seriesName.includes('占比');
          const val = isRatio ? `${((p.value as number) * 100).toFixed(1)}%` : String(p.value);
          lines.push(`${p.seriesName}：${val}`);
        });
        return lines.join('<br/>');
      },
    },
    series: [
      {
        name: '充电异常设备数',
        type: 'bar' as const,
        yAxisIndex: 0,
        data: points.map((p) => p.chargingAbnormalCount),
        barMaxWidth: 20,
        itemStyle: {
          color: (params: any) => {
            const val = points[params.dataIndex]?.chargingAbnormalCount as number;
            return getAlertLevel('chargingAbnormalCount', val) === 'red' ? '#f85149' : '#bc8cff';
          },
        },
      },
      {
        name: '高耗电占比',
        type: 'line' as const,
        yAxisIndex: 1,
        data: points.map((p) => p.highPowerRatio),
        smooth: true,
        color: '#e3b341',
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
      <div className={styles.chartTitle}>供电健康趋势</div>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <ReactECharts option={distOption} style={{ height: 220 }} opts={{ renderer: 'svg' }} />
        <ReactECharts
          option={trendOption}
          style={{ height: 220 }}
          onEvents={{ click: handleClick }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  );
}

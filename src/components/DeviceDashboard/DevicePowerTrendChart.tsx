import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Radio } from 'antd';
import { useDeviceTrendData } from '../../hooks/useDeviceData';
import { useDeviceStore } from '../../store/useDeviceStore';
import { getAlertLevel } from '../../utils/deviceThresholds';
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

  const option = {
    grid: { top: 40, right: 70, bottom: 60, left: 70 },
    legend: { top: 8, data: ['日耗电量(度)', '高耗电占比', '充电异常设备数'] },
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
        name: '耗电/占比',
        position: 'left' as const,
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
          lines.push(`${p.seriesName}：${p.value}`);
        });
        return lines.join('<br/>');
      },
    },
    series: [
      {
        name: '日耗电量(度)',
        type: 'line' as const,
        yAxisIndex: 0,
        data: points.map((p) => p.dailyPowerConsumption),
        smooth: true,
        color: '#58a6ff',
      },
      {
        name: '高耗电占比',
        type: 'line' as const,
        yAxisIndex: 0,
        data: points.map((p) => p.highPowerRatio),
        smooth: true,
        color: '#e3b341',
      },
      {
        name: '充电异常设备数',
        type: 'bar' as const,
        yAxisIndex: 1,
        data: points.map((p) => p.chargingAbnormalCount),
        barMaxWidth: 20,
        itemStyle: {
          color: (params: any) => {
            const val = points[params.dataIndex]?.chargingAbnormalCount as number;
            return getAlertLevel('chargingAbnormalCount', val) === 'red' ? '#f85149' : '#bc8cff';
          },
        },
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
      <ReactECharts
        option={option}
        style={{ height: 280 }}
        onEvents={{ click: handleClick }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}

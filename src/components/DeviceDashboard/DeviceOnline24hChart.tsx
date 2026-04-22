import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './TrendChart.module.css';

// 生成近24小时的模拟在线波动数据（每小时一个点）
function generateOnline24hData() {
  const now = new Date();
  const points = [];
  const baseOnline = 980000;
  const baseOffline = 230000;
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const h = String(t.getHours()).padStart(2, '0');
    const label = `${h}:00`;
    const jitter = (Math.random() - 0.5) * 0.04;
    const onlineRate = parseFloat((0.81 + jitter).toFixed(4));
    const onlineCount = Math.round(baseOnline * (1 + (Math.random() - 0.5) * 0.03));
    const offlineCount = Math.round(baseOffline * (1 + (Math.random() - 0.5) * 0.05));
    points.push({ label, onlineRate, onlineCount, offlineCount });
  }
  return points;
}

export default function DeviceOnline24hChart() {
  const [points, setPoints] = useState(generateOnline24hData);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 5分钟自动刷新
  useEffect(() => {
    const timer = setInterval(() => {
      setPoints(generateOnline24hData());
      setLastUpdated(new Date());
    }, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const option = {
    grid: { top: 48, right: 70, bottom: 40, left: 64 },
    legend: { top: 8, data: ['在线率', '在线设备数', '离线设备数'], textStyle: { fontSize: 11 } },
    xAxis: {
      type: 'category' as const,
      data: points.map((p) => p.label),
      axisLabel: {
        rotate: 30,
        fontSize: 10,
        interval: 3,
      },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '在线率',
        min: 0.7,
        max: 1,
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%`, fontSize: 10 },
        nameTextStyle: { fontSize: 11 },
      },
      {
        type: 'value' as const,
        name: '设备数',
        position: 'right' as const,
        axisLabel: {
          formatter: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v),
          fontSize: 10,
        },
        nameTextStyle: { fontSize: 11 },
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const lines = [params[0]?.axisValue ?? ''];
        params.forEach((p) => {
          const isRate = p.seriesName === '在线率';
          const val = isRate ? `${((p.value as number) * 100).toFixed(1)}%` : `${((p.value as number) / 10000).toFixed(1)}万`;
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
        symbol: 'none',
        lineStyle: { width: 2 },
        areaStyle: { color: 'rgba(63,185,80,0.08)' },
      },
      {
        name: '在线设备数',
        type: 'line' as const,
        yAxisIndex: 1,
        data: points.map((p) => p.onlineCount),
        smooth: true,
        color: '#58a6ff',
        symbol: 'none',
        lineStyle: { width: 1.5, type: 'dashed' as const },
      },
      {
        name: '离线设备数',
        type: 'line' as const,
        yAxisIndex: 1,
        data: points.map((p) => p.offlineCount),
        smooth: true,
        color: '#f85149',
        symbol: 'none',
        lineStyle: { width: 1.5, type: 'dashed' as const },
      },
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>近24小时在线波动</div>
        <div style={{ fontSize: 11, color: '#8b949e' }}>
          实时更新 · {formatTime(lastUpdated)}
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 260, width: '100%' }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

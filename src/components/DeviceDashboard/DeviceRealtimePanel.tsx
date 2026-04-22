/**
 * 右侧独立监控区（C类 + B类模块）
 * - 实时在线率/在线数/离线数（5分钟自动刷新）
 * - 近24小时在线波动趋势
 * - 电量分布（独立时间控件）
 * - 预览时长分布（独立时间控件）
 * - 专题诊断入口
 */
import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Radio, Button } from 'antd';
import { mockPowerDistribution, mockPreviewDuration } from '../../api/deviceMockData';
import DeviceTopicEntries from './DeviceTopicEntries';
import styles from './DeviceRealtimePanel.module.css';

// ─── 实时数据生成 ─────────────────────────────────────────────────────────────

function generateRealtimeStats() {
  const onlineRate = parseFloat((0.81 + (Math.random() - 0.5) * 0.04).toFixed(4));
  const totalActive = 726000 + Math.round((Math.random() - 0.5) * 10000);
  return {
    onlineRate,
    onlineCount: Math.round(totalActive * onlineRate),
    offlineCount: Math.round(totalActive * (1 - onlineRate)),
    updatedAt: new Date(),
  };
}

function generateOnline24hData() {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    const h = String(t.getHours()).padStart(2, '0');
    const jitter = (Math.random() - 0.5) * 0.04;
    const onlineRate = parseFloat((0.81 + jitter).toFixed(4));
    return {
      label: `${h}:00`,
      onlineRate,
      onlineCount: Math.round(980000 * (1 + (Math.random() - 0.5) * 0.03)),
      offlineCount: Math.round(230000 * (1 + (Math.random() - 0.5) * 0.05)),
    };
  });
}

// B类独立时间选项
const B_TIME_OPTIONS = [
  { value: '24h',  label: '近24小时' },
  { value: '7d',   label: '近7天' },
  { value: '30d',  label: '近30天' },
  { value: '90d',  label: '近90天' },
  { value: 'snap', label: '截至截止日' },
];

// ─── 子组件：实时KPI卡片 ──────────────────────────────────────────────────────

function RealtimeKPICard({ label, value, unit, color }: {
  label: string; value: string; unit?: string; color?: string;
}) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue} style={{ color: color ?? '#1677ff' }}>
        {value}
        {unit && <span className={styles.kpiUnit}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function DeviceRealtimePanel() {
  const [stats, setStats] = useState(generateRealtimeStats);
  const [online24h, setOnline24h] = useState(generateOnline24hData);
  const [powerTimeRange, setPowerTimeRange] = useState('7d');
  const [previewTimeRange, setPreviewTimeRange] = useState('7d');

  // 5分钟自动刷新实时数据
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(generateRealtimeStats());
      setOnline24h(generateOnline24hData());
    }, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  // 近24h在线波动图
  const online24hOption = {
    grid: { top: 48, right: 70, bottom: 36, left: 60 },
    legend: { top: 8, data: ['在线率', '在线设备数', '离线设备数'], textStyle: { fontSize: 10 } },
    xAxis: {
      type: 'category' as const,
      data: online24h.map((p) => p.label),
      axisLabel: { rotate: 30, fontSize: 10, interval: 3 },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '在线率',
        min: 0.7,
        max: 1,
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%`, fontSize: 10 },
        nameTextStyle: { fontSize: 10 },
      },
      {
        type: 'value' as const,
        name: '设备数',
        position: 'right' as const,
        axisLabel: {
          formatter: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v),
          fontSize: 10,
        },
        nameTextStyle: { fontSize: 10 },
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const lines = [params[0]?.axisValue ?? ''];
        params.forEach((p) => {
          const isRate = p.seriesName === '在线率';
          const val = isRate
            ? `${((p.value as number) * 100).toFixed(1)}%`
            : `${((p.value as number) / 10000).toFixed(1)}万`;
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
        data: online24h.map((p) => p.onlineRate),
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
        data: online24h.map((p) => p.onlineCount),
        smooth: true,
        color: '#58a6ff',
        symbol: 'none',
        lineStyle: { width: 1.5, type: 'dashed' as const },
      },
      {
        name: '离线设备数',
        type: 'line' as const,
        yAxisIndex: 1,
        data: online24h.map((p) => p.offlineCount),
        smooth: true,
        color: '#f85149',
        symbol: 'none',
        lineStyle: { width: 1.5, type: 'dashed' as const },
      },
    ],
  };

  // 电量分布图
  const powerDistOption = {
    grid: { top: 16, right: 16, bottom: 36, left: 60 },
    xAxis: {
      type: 'category' as const,
      data: mockPowerDistribution.buckets.map((b) => b.label),
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%`, fontSize: 10 },
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => `${params[0].name}：${((params[0].value as number) * 100).toFixed(1)}%`,
    },
    series: [{
      type: 'bar' as const,
      data: mockPowerDistribution.buckets.map((b) => b.ratio),
      barMaxWidth: 36,
      itemStyle: { color: '#58a6ff' },
      label: {
        show: true,
        position: 'top' as const,
        formatter: (p: any) => `${((p.value as number) * 100).toFixed(1)}%`,
        fontSize: 10,
      },
    }],
  };

  // 预览时长分布图
  const previewDistOption = {
    grid: { top: 16, right: 16, bottom: 36, left: 60 },
    xAxis: {
      type: 'category' as const,
      data: mockPreviewDuration.buckets.map((b) => b.label),
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v),
        fontSize: 10,
      },
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any[]) => {
        const v = params[0].value as number;
        return `${params[0].name}：${v >= 10000 ? `${(v / 10000).toFixed(1)}万` : v}台`;
      },
    },
    series: [{
      type: 'bar' as const,
      data: mockPreviewDuration.buckets.map((b) => b.count),
      barMaxWidth: 36,
      itemStyle: { color: '#bc8cff' },
      label: {
        show: true,
        position: 'top' as const,
        formatter: (p: any) => {
          const v = p.value as number;
          return v >= 10000 ? `${(v / 10000).toFixed(1)}万` : String(v);
        },
        fontSize: 10,
      },
    }],
  };

  return (
    <div className={styles.panel}>
      {/* 实时在线监控 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>实时在线监控</span>
          <span className={styles.realtimeBadge}>实时 · {formatTime(stats.updatedAt)}</span>
          <Button
            size="small"
            onClick={() => { setStats(generateRealtimeStats()); setOnline24h(generateOnline24hData()); }}
          >
            刷新
          </Button>
        </div>
        <div className={styles.kpiRow}>
          <RealtimeKPICard
            label="实时在线率"
            value={`${(stats.onlineRate * 100).toFixed(1)}%`}
            color={stats.onlineRate < 0.85 ? '#faad14' : '#3fb950'}
          />
          <RealtimeKPICard
            label="在线设备数"
            value={`${(stats.onlineCount / 10000).toFixed(1)}`}
            unit="万台"
            color="#58a6ff"
          />
          <RealtimeKPICard
            label="离线设备数"
            value={`${(stats.offlineCount / 10000).toFixed(1)}`}
            unit="万台"
            color="#f85149"
          />
        </div>
      </div>

      {/* 近24小时在线波动 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>近24小时在线波动</div>
        <ReactECharts option={online24hOption} style={{ height: 220, width: '100%' }} opts={{ renderer: 'svg' }} />
      </div>

      {/* 电量分布（B类，独立时间） */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>电量分布</span>
          <Radio.Group
            value={powerTimeRange}
            onChange={(e) => setPowerTimeRange(e.target.value)}
            size="small"
            optionType="button"
            buttonStyle="solid"
            options={B_TIME_OPTIONS}
          />
        </div>
        <ReactECharts option={powerDistOption} style={{ height: 180, width: '100%' }} opts={{ renderer: 'svg' }} />
      </div>

      {/* 预览时长分布（B类，独立时间） */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>设备预览时长分布</span>
          <Radio.Group
            value={previewTimeRange}
            onChange={(e) => setPreviewTimeRange(e.target.value)}
            size="small"
            optionType="button"
            buttonStyle="solid"
            options={B_TIME_OPTIONS}
          />
        </div>
        <ReactECharts option={previewDistOption} style={{ height: 180, width: '100%' }} opts={{ renderer: 'svg' }} />
      </div>

      {/* 专题诊断入口 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>专题诊断入口</div>
        <DeviceTopicEntries compact />
      </div>
    </div>
  );
}

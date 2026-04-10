import { useMemo } from 'react';
import type { HeatmapAppMetric, HeatmapMetricKey } from '../../types/heatmap';
import { formatMetricDisplay } from '../../utils/heatmapThresholds';
import styles from './HeatmapKPICards.module.css';

interface Props {
  data: HeatmapAppMetric[];
}

interface KPIDef {
  key: HeatmapMetricKey;
  label: string;
  aggregate: 'sum' | 'avg';
}

const KPI_DEFS: KPIDef[] = [
  { key: 'deviceCount', label: '激活设备数', aggregate: 'sum' },
  { key: 'subscriptionConversionRate', label: '设备订阅转化率', aggregate: 'avg' },
  { key: 'subscriptionRetentionRate', label: '设备订阅留存率', aggregate: 'avg' },
  { key: 'revenuePerDevice', label: '单设备收入', aggregate: 'avg' },
];

function aggregateMetric(data: HeatmapAppMetric[], key: HeatmapMetricKey, type: 'sum' | 'avg'): number | null {
  const valid = data.filter((d) => d[key] !== null && d[key] !== undefined);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, d) => acc + (d[key] as number), 0);
  return type === 'sum' ? sum : sum / valid.length;
}

function aggregateChange(data: HeatmapAppMetric[], key: HeatmapMetricKey, changeField: 'yoyChange' | 'momChange'): number | null {
  const valid = data.filter((d) => d[changeField]?.[key] !== null && d[changeField]?.[key] !== undefined);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, d) => acc + (d[changeField][key] as number), 0);
  return sum / valid.length;
}

function formatChange(val: number | null): { text: string; className: string } {
  if (val === null) return { text: '--', className: styles.flat };
  const pct = (val * 100).toFixed(1);
  if (val > 0) return { text: `↑${pct}%`, className: styles.up };
  if (val < 0) return { text: `↓${Math.abs(val * 100).toFixed(1)}%`, className: styles.down };
  return { text: '0%', className: styles.flat };
}

export default function HeatmapKPICards({ data }: Props) {
  const kpis = useMemo(() => {
    return KPI_DEFS.map((def) => {
      const value = aggregateMetric(data, def.key, def.aggregate);
      const yoy = aggregateChange(data, def.key, 'yoyChange');
      const mom = aggregateChange(data, def.key, 'momChange');
      return { ...def, value, yoy, mom };
    });
  }, [data]);

  return (
    <div className={styles.container}>
      {kpis.map((kpi) => {
        const yoyInfo = formatChange(kpi.yoy);
        const momInfo = formatChange(kpi.mom);
        return (
          <div key={kpi.key} className={styles.card}>
            <span className={styles.label}>{kpi.label}</span>
            <span className={styles.value}>
              {kpi.value !== null ? formatMetricDisplay(kpi.value, kpi.key) : '--'}
            </span>
            <div className={styles.change}>
              <span className={yoyInfo.className}>同比 {yoyInfo.text}</span>
              <span className={momInfo.className}>环比 {momInfo.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

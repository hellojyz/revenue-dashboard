import { useMemo } from 'react';
import type { HeatmapAppMetric, HeatmapMetricKey } from '../../types/heatmap';
import { formatMetricDisplay } from '../../utils/heatmapThresholds';
import { useI18n } from '../../i18n/I18nContext';
import styles from './HeatmapKPICards.module.css';

interface Props { data: HeatmapAppMetric[]; }
interface KPIDef { key: HeatmapMetricKey; labelKey: string; aggregate: 'sum' | 'avg'; }

const KPI_DEFS: KPIDef[] = [
  { key: 'deviceCount', labelKey: 'activatedDevices', aggregate: 'sum' },
  { key: 'subscriptionConversionRate', labelKey: 'subscriptionConversion', aggregate: 'avg' },
  { key: 'subscriptionRetentionRate', labelKey: 'subscriptionRetention', aggregate: 'avg' },
  { key: 'revenuePerDevice', labelKey: 'revenuePerDeviceKPI', aggregate: 'avg' },
];

function agg(data: HeatmapAppMetric[], key: HeatmapMetricKey, type: 'sum' | 'avg'): number | null {
  const v = data.filter((d) => d[key] !== null && d[key] !== undefined);
  if (!v.length) return null;
  const s = v.reduce((a, d) => a + (d[key] as number), 0);
  return type === 'sum' ? s : s / v.length;
}

function aggChange(data: HeatmapAppMetric[], key: HeatmapMetricKey, field: 'yoyChange' | 'momChange'): number | null {
  const v = data.filter((d) => d[field]?.[key] != null);
  if (!v.length) return null;
  return v.reduce((a, d) => a + (d[field][key] as number), 0) / v.length;
}

function fmtChange(val: number | null, cls: typeof styles) {
  if (val === null) return { text: '--', className: cls.flat };
  if (val > 0) return { text: `↑${(val * 100).toFixed(1)}%`, className: cls.up };
  if (val < 0) return { text: `↓${Math.abs(val * 100).toFixed(1)}%`, className: cls.down };
  return { text: '0%', className: cls.flat };
}

export default function HeatmapKPICards({ data }: Props) {
  const { t } = useI18n();
  const kpis = useMemo(() => KPI_DEFS.map((def) => ({
    ...def,
    label: (t as any)[def.labelKey] as string,
    value: agg(data, def.key, def.aggregate),
    yoy: aggChange(data, def.key, 'yoyChange'),
    mom: aggChange(data, def.key, 'momChange'),
  })), [data, t]);

  return (
    <div className={styles.container}>
      {kpis.map((kpi) => {
        const y = fmtChange(kpi.yoy, styles);
        const m = fmtChange(kpi.mom, styles);
        return (
          <div key={kpi.key} className={styles.card}>
            <span className={styles.label}>{kpi.label}</span>
            <span className={styles.value}>{kpi.value !== null ? formatMetricDisplay(kpi.value, kpi.key) : '--'}</span>
            <div className={styles.change}>
              <span className={y.className}>{t.yoy} {y.text}</span>
              <span className={m.className}>{t.mom} {m.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

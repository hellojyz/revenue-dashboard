import { useMemo, useState } from 'react';
import { Collapse } from 'antd';
import { useHeatmapStore } from '../../store/useHeatmapStore';
import { evaluateAlerts, evaluateVolatilityAlerts, DEFAULT_HEATMAP_THRESHOLDS, DEFAULT_VOLATILITY_THRESHOLDS, METRIC_LABELS } from '../../utils/heatmapThresholds';
import { useI18n } from '../../i18n/I18nContext';
import type { HeatmapAppMetric, HeatmapFilters, HeatmapMetricKey } from '../../types/heatmap';
import styles from './HeatmapAlertMonitor.module.css';

interface Props { data: HeatmapAppMetric[]; filters: HeatmapFilters; }

export default function HeatmapAlertMonitor({ data, filters }: Props) {
  const { t } = useI18n();
  const highlight = useHeatmapStore((s) => s.highlight);
  const toggleHighlight = useHeatmapStore((s) => s.toggleHighlight);
  const [collapsed, setCollapsed] = useState(false);

  const alerts = useMemo(() => evaluateAlerts(data, DEFAULT_HEATMAP_THRESHOLDS, filters), [data, filters]);
  const volatilityAlerts = useMemo(() => evaluateVolatilityAlerts(data, DEFAULT_VOLATILITY_THRESHOLDS), [data]);
  const volatilitySet = useMemo(() => {
    const set = new Set<string>();
    for (const va of volatilityAlerts) set.add(`${va.appName}|${va.metricKey}|${va.type}`);
    return set;
  }, [volatilityAlerts]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const hasVol = (app: string, key: HeatmapMetricKey) => volatilitySet.has(`${app}|${key}|yoy`) || volatilitySet.has(`${app}|${key}|mom`);

  if (alerts.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}><span className={styles.title}>{t.alertTitle}</span></div>
        <div className={styles.emptyAlert}>{t.alertNormal}</div>
      </div>
    );
  }

  const content = (
    <div className={styles.alertList}>
      {alerts.map((alert) => {
        const hl = highlight?.appName === alert.appName && highlight?.metricKey === alert.metricKey;
        return (
          <div key={alert.id} className={`${styles.alertItem} ${hl ? styles.alertItemHighlighted : ''}`}
            onClick={() => toggleHighlight({ appName: alert.appName, metricKey: alert.metricKey })}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleHighlight({ appName: alert.appName, metricKey: alert.metricKey }); }}>
            <span className={`${styles.severityDot} ${alert.severity === 'critical' ? styles.dotCritical : styles.dotWarning}`} />
            <div className={styles.alertContent}>
              <div className={styles.alertTitle}>
                {alert.appName} - {METRIC_LABELS[alert.metricKey]}
                {hasVol(alert.appName, alert.metricKey) && <span className={styles.volatilityTag}>{t.volatilityAnomaly}</span>}
              </div>
              <div className={styles.alertAttribution}>{alert.attributionText}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>
          {t.alertTitle}
          {criticalCount > 0 && <span className={`${styles.badge} ${styles.badgeCritical}`}>{t.severe} {criticalCount}</span>}
          {warningCount > 0 && <span className={`${styles.badge} ${styles.badgeWarning}`}>{t.warning} {warningCount}</span>}
        </span>
      </div>
      <Collapse activeKey={collapsed ? [] : ['alerts']} onChange={(keys) => setCollapsed(keys.length === 0)} ghost
        items={[{ key: 'alerts', label: `${t.total} ${alerts.length} ${t.items}`, children: content }]} />
    </div>
  );
}

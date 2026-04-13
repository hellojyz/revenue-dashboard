import { useSimpleAlerts } from '../../hooks/useSimpleDashboardData';
import { useI18n } from '../../i18n/I18nContext';
import { formatPercent, formatChange } from '../../utils/formatters';
import monitorStyles from '../AlertMonitor/AlertMonitor.module.css';
import cardStyles from '../AlertMonitor/AlertCard.module.css';

const SimpleAlertMonitor: React.FC = () => {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useSimpleAlerts();

  const sortedAlerts = data?.alerts
    ? [...data.alerts].sort((a, b) => {
        const order = { critical: 0, warning: 1 };
        return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
      })
    : [];

  const criticalCount = sortedAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = sortedAlerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className={monitorStyles.monitor}>
      <div className={monitorStyles.monitorTitle}>{t.alertMonitorTitle}</div>

      {isLoading && (
        <div className={monitorStyles.statusContainer}>{t.loading}</div>
      )}

      {isError && (
        <div className={monitorStyles.errorContainer}>
          <span className={monitorStyles.errorText}>{t.loadFailed}</span>
          <button className={monitorStyles.retryButton} onClick={() => refetch()}>
            {t.retry}
          </button>
        </div>
      )}

      {!isLoading && !isError && sortedAlerts.length === 0 && (
        <div className={monitorStyles.emptyContainer}>
          <span className={monitorStyles.emptyIcon}>✓</span>
          <span>{t.noAlerts}</span>
        </div>
      )}

      {!isLoading && !isError && sortedAlerts.length > 0 && (
        <>
          <div className={monitorStyles.alertSummary}>
            <span className={`${monitorStyles.alertSummaryItem} ${monitorStyles.alertSummaryCritical}`}>
              {t.severeCN} {criticalCount} {t.items}
            </span>
            <span className={`${monitorStyles.alertSummaryItem} ${monitorStyles.alertSummaryWarning}`}>
              {t.warningCN} {warningCount} {t.items}
            </span>
          </div>
          <div className={monitorStyles.alertList}>
            {sortedAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const alertCardClass = `${cardStyles.alertCard} ${isCritical ? cardStyles.critical : cardStyles.warning}`;
              const badgeClass = `${cardStyles.severityBadge} ${isCritical ? cardStyles.badgeCritical : cardStyles.badgeWarning}`;

              return (
                <div key={alert.id} className={alertCardClass}>
                  <div className={cardStyles.header}>
                    <span className={badgeClass}>
                      {isCritical ? t.severeCN : t.warningCN}
                    </span>
                    <span className={cardStyles.title}>{alert.title}</span>
                  </div>
                  <div className={cardStyles.detail}>
                    <div className={cardStyles.detailRow}>
                      <span className={cardStyles.detailLabel}>{t.currentVsThreshold}</span>
                      <span className={cardStyles.detailValue}>
                        {formatPercent(alert.currentValue)} / {formatPercent(alert.threshold)}
                      </span>
                    </div>
                    {alert.changePercent !== undefined && (
                      <div className={cardStyles.detailRow}>
                        <span className={cardStyles.detailLabel}>{t.changeAmount}</span>
                        <span className={`${cardStyles.changeValue} ${cardStyles.changeUp}`}>
                          {formatChange(alert.changePercent)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleAlertMonitor;

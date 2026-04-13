import { useAlertData } from '../../hooks/useDashboardData';
import { sortAlerts } from '../../utils/alertRules';
import { useI18n } from '../../i18n/I18nContext';
import AlertCard from './AlertCard';
import styles from './AlertMonitor.module.css';

const TOP_N = 5;

/**
 * AlertMonitor 异常监控区域组件
 * 消费 useAlertData hook 获取告警数据
 * 调用 sortAlerts 排序后展示 Top N 告警卡片列表
 */
const AlertMonitor: React.FC = () => {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useAlertData();

  const allAlerts = data?.alerts ? sortAlerts(data.alerts) : [];
  const sortedAlerts = allAlerts.slice(0, TOP_N);
  const criticalCount = allAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = allAlerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className={styles.monitor}>
      <div className={styles.monitorTitle}>{t.alertMonitorTitle}</div>
      {isLoading && (
        <div className={styles.statusContainer}>{t.loading}</div>
      )}
      {isError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{t.alertLoadFailed}</span>
          <button className={styles.retryButton} onClick={() => refetch()}>
            {t.retry}
          </button>
        </div>
      )}
      {!isLoading && !isError && sortedAlerts.length === 0 && (
        <div className={styles.emptyContainer}>
          <span className={styles.emptyIcon}>✓</span>
          <span>{t.noAlerts}</span>
        </div>
      )}
      {!isLoading && !isError && sortedAlerts.length > 0 && (
        <>
          <div className={styles.alertSummary}>
            <span className={`${styles.alertSummaryItem} ${styles.alertSummaryCritical}`}>
              {t.severeCN} {criticalCount} {t.items}
            </span>
            <span className={`${styles.alertSummaryItem} ${styles.alertSummaryWarning}`}>
              {t.warningCN} {warningCount} {t.items}
            </span>
          </div>
          <div className={styles.alertList}>
            {sortedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                severity={alert.severity}
                title={alert.title}
                productType={alert.productType ?? alert.deviceType}
                currentValue={alert.currentValue}
                threshold={alert.threshold}
                changePercent={alert.changePercent}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AlertMonitor;

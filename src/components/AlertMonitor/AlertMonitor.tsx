import { useAlertData } from '../../hooks/useDashboardData';
import { sortAlerts } from '../../utils/alertRules';
import AlertCard from './AlertCard';
import styles from './AlertMonitor.module.css';

const TOP_N = 5;

/**
 * AlertMonitor 异常监控区域组件
 * 消费 useAlertData hook 获取告警数据
 * 调用 sortAlerts 排序后展示 Top N 告警卡片列表
 */
const AlertMonitor: React.FC = () => {
  const { data, isLoading, isError, refetch } = useAlertData();

  const allAlerts = data?.alerts ? sortAlerts(data.alerts) : [];
  const sortedAlerts = allAlerts.slice(0, TOP_N);
  const criticalCount = allAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = allAlerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className={styles.monitor}>
      <div className={styles.monitorTitle}>预测异常监控告警</div>
      {isLoading && (
        <div className={styles.statusContainer}>加载中...</div>
      )}
      {isError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>告警数据加载失败</span>
          <button className={styles.retryButton} onClick={() => refetch()}>
            重试
          </button>
        </div>
      )}
      {!isLoading && !isError && sortedAlerts.length === 0 && (
        <div className={styles.emptyContainer}>
          <span className={styles.emptyIcon}>✓</span>
          <span>当前无异常</span>
        </div>
      )}
      {!isLoading && !isError && sortedAlerts.length > 0 && (
        <>
          <div className={styles.alertSummary}>
            <span className={`${styles.alertSummaryItem} ${styles.alertSummaryCritical}`}>
              严重 {criticalCount} 条
            </span>
            <span className={`${styles.alertSummaryItem} ${styles.alertSummaryWarning}`}>
              警告 {warningCount} 条
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

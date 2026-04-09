import type { AlertCardProps } from '../../types/dashboard';
import { formatPercent, formatChange } from '../../utils/formatters';
import styles from './AlertCard.module.css';

/**
 * AlertCard 单个告警卡片组件
 * 根据 severity 展示红色（critical）或橙色（warning）风险标识
 * 展示告警标题、异常产品/设备类型、当前值、阈值、变化幅度
 */
const AlertCard: React.FC<AlertCardProps> = ({
  severity,
  title,
  productType,
  currentValue,
  threshold,
  changePercent,
}) => {
  const cardClass = `${styles.alertCard} ${severity === 'critical' ? styles.critical : styles.warning}`;
  const badgeClass = `${styles.severityBadge} ${severity === 'critical' ? styles.badgeCritical : styles.badgeWarning}`;
  const badgeText = severity === 'critical' ? '严重' : '警告';

  return (
    <div className={cardClass} data-testid="alert-card">
      <div className={styles.header}>
        <span className={badgeClass}>{badgeText}</span>
        <span className={styles.title}>
          {title}{productType ? `（${productType}）` : ''}
        </span>
      </div>
      <div className={styles.detail}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>当前值 / 阈值</span>
          <span className={styles.detailValue}>
            {formatPercent(currentValue)} / {formatPercent(threshold)}
          </span>
        </div>
        {changePercent !== undefined && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>变化幅度</span>
            <span className={`${styles.changeValue} ${styles.changeUp}`}>
              {formatChange(changePercent)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCard;

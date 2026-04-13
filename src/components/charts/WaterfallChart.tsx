import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useWaterfallData } from '../../hooks/useDashboardData';
import { buildWaterfallOption } from '../../utils/chartHelpers';
import { useI18n } from '../../i18n/I18nContext';
import styles from './ChartCard.module.css';

const WaterfallChart: React.FC = () => {
  const { t } = useI18n();
  const drillDownDate = useDashboardStore((s) => s.drillDownDate);
  const { data, isLoading, isError, refetch } = useWaterfallData();

  const option = buildWaterfallOption(data);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        {t.waterfallTitle}{drillDownDate ? ` — ${drillDownDate}` : ''}
      </div>
      {isLoading && (
        <div className={styles.statusContainer}>{t.loading}</div>
      )}
      {isError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{t.loadFailed}</span>
          <button className={styles.retryButton} onClick={() => refetch()}>
            {t.retry}
          </button>
        </div>
      )}
      {!isLoading && !isError && !data && (
        <div className={styles.statusContainer}>{t.noData}</div>
      )}
      {!isLoading && !isError && data && (
        <div className={styles.chartArea}>
          <ReactECharts
            option={option}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      )}
    </div>
  );
};

export default WaterfallChart;

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useRevenueForecastV2Data } from '../../hooks/useDashboardData';
import { buildRevenueForecastV2Option } from '../../utils/chartHelpers';
import { useI18n } from '../../i18n/I18nContext';
import styles from './ChartCard.module.css';

const RevenueForecastV2Chart: React.FC = () => {
  const { t } = useI18n();
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const { data, isLoading, isError, refetch } = useRevenueForecastV2Data();

  const GRANULARITY_SUBTITLE: Record<string, string> = useMemo(() => ({
    week: t.last8weeks,
    month: t.last6months,
  }), [t]);

  const option = buildRevenueForecastV2Option(data, data?.dateRanges);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        {t.revForecastTitle}
        {GRANULARITY_SUBTITLE[timeGranularity] && (
          <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8 }}>
            （{GRANULARITY_SUBTITLE[timeGranularity]}）
          </span>
        )}
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
      {!isLoading && !isError && (!data || !data.dates?.length) && (
        <div className={styles.statusContainer}>{t.noData}</div>
      )}
      {!isLoading && !isError && data && data.dates?.length > 0 && (
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

export default RevenueForecastV2Chart;

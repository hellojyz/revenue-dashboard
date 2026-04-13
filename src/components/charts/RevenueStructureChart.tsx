import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useRevenueStructureData } from '../../hooks/useDashboardData';
import { buildRevenueStructureOption } from '../../utils/chartHelpers';
import { useI18n } from '../../i18n/I18nContext';
import styles from './ChartCard.module.css';

const RevenueStructureChart: React.FC = () => {
  const { t } = useI18n();
  const drillDownDate = useDashboardStore((s) => s.drillDownDate);
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const { data, isLoading, isError, refetch } = useRevenueStructureData();

  const GRANULARITY_SUBTITLE: Record<string, string> = useMemo(() => ({
    week: t.last8weeks,
    month: t.last6months,
  }), [t]);

  const option = buildRevenueStructureOption(data, data?.dateRanges);

  // Highlight drillDownDate via markLine on the first series
  if (drillDownDate && data?.dates?.length && option.xAxis) {
    const idx = data.dates.indexOf(drillDownDate);
    if (idx >= 0) {
      (option as Record<string, unknown>).series = (
        option.series as Array<Record<string, unknown>>
      ).map((s, i) =>
        i === 0
          ? {
              ...s,
              markLine: {
                silent: true,
                symbol: 'none',
                lineStyle: { color: '#e6edf3', type: 'dashed', width: 1 },
                data: [{ xAxis: drillDownDate }],
              },
            }
          : s,
      );
    }
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        {t.revStructTitle}
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

export default RevenueStructureChart;

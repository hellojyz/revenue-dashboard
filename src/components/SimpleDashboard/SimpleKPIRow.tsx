import { useMemo } from 'react';
import { useSimpleKPI } from '../../hooks/useSimpleDashboardData';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatLargeNumber } from '../../utils/formatters';
import { getPeriodLabel } from '../../utils/timeAggregation';
import { useI18n } from '../../i18n/I18nContext';
import KPICard from '../KPICard/KPICard';
import styles from '../KPICard/KPICardRow.module.css';

const SimpleKPIRow: React.FC = () => {
  const { t } = useI18n();
  const { data, isLoading, isError } = useSimpleKPI();
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const dateRange = useDashboardStore((s) => s.filters.dateRange);

  const prefix = useMemo(() => {
    if (timeGranularity === 'month') return t.granMonthly;
    return t.granDaily;
  }, [timeGranularity, t]);

  const subtitle =
    timeGranularity === 'month'
      ? getPeriodLabel(timeGranularity, dateRange[1])
      : undefined;

  if (isLoading) return <div className={styles.loading}>{t.loading}</div>;
  if (isError) return <div className={styles.error}>{t.loadFailed}</div>;

  return (
    <div className={styles.row} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      <KPICard
        title={`${prefix}${t.orderAmount}`}
        value={data ? `¥${formatLargeNumber(data.orderAmount.value)}` : '--'}
        changePercent={data?.orderAmount.changePercent ?? NaN}
        sparklineData={data?.orderAmount.sparkline ?? []}
        subtitle={subtitle}
      />
      <KPICard
        title={`${prefix}${t.meariSalesForecast2}`}
        value={data ? `¥${formatLargeNumber(data.meariSales.value)}` : '--'}
        changePercent={data?.meariSales.changePercent ?? NaN}
        sparklineData={data?.meariSales.sparkline ?? []}
        subtitle={subtitle}
      />
      <KPICard
        title={`${prefix}${t.confirmedRevForecast2}`}
        value={data ? `¥${formatLargeNumber(data.confirmedRevenue.value)}` : '--'}
        changePercent={data?.confirmedRevenue.changePercent ?? NaN}
        sparklineData={data?.confirmedRevenue.sparkline ?? []}
        highlighted
        subtitle={subtitle}
      />
      <KPICard
        title={`${prefix}${t.newMonthConfirmedForecast}`}
        value={data ? `¥${formatLargeNumber(data.newMonthConfirmed.value)}` : '--'}
        changePercent={data?.newMonthConfirmed.changePercent ?? NaN}
        sparklineData={data?.newMonthConfirmed.sparkline ?? []}
        subtitle={subtitle}
      />
    </div>
  );
};

export default SimpleKPIRow;

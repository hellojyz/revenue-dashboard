import { useMemo } from 'react';
import { useKPIData } from '../../hooks/useDashboardData';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatLargeNumber, formatPercent } from '../../utils/formatters';
import { getPeriodLabel } from '../../utils/timeAggregation';
import { useI18n } from '../../i18n/I18nContext';
import KPICard from './KPICard';
import styles from './KPICardRow.module.css';

const KPICardRow = () => {
  const { t } = useI18n();
  const { data, isLoading, isError } = useKPIData();
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const dateRange = useDashboardStore((s) => s.filters.dateRange);

  const GRANULARITY_LABELS: Record<string, string> = useMemo(() => ({
    day: t.granDaily,
    week: t.granWeekly,
    month: t.granMonthly,
  }), [t]);

  const prefix = GRANULARITY_LABELS[timeGranularity] ?? t.granDaily;

  // 非日粒度下显示统计周期副标题
  const subtitle =
    timeGranularity !== 'day'
      ? getPeriodLabel(timeGranularity, dateRange[1])
      : undefined;

  if (isLoading) {
    return <div className={styles.loading}>{t.kpiLoading}</div>;
  }

  if (isError) {
    return <div className={styles.error}>{t.kpiError2}</div>;
  }

  const kpi = data;

  return (
    <div className={styles.row}>
      <KPICard
        title={`${prefix}${t.confirmedRevForecast}`}
        value={kpi ? `¥${formatLargeNumber(kpi.confirmedRevenue.value)}` : '--'}
        changePercent={kpi?.confirmedRevenue.changePercent ?? NaN}
        sparklineData={kpi?.confirmedRevenue.sparkline ?? []}
        highlighted
        subtitle={subtitle}
      />
      <KPICard
        title={t.meariSalesForecast}
        value={kpi ? `¥${formatLargeNumber(kpi.meariSales.value)}` : '--'}
        changePercent={kpi?.meariSales.changePercent ?? NaN}
        sparklineData={kpi?.meariSales.sparkline ?? []}
        subtitle={subtitle}
      />
      <KPICard
        title={`${prefix}${t.costForecastKPI}`}
        value={kpi ? `¥${formatLargeNumber(kpi.costPrediction.value)}` : '--'}
        changePercent={kpi?.costPrediction.changePercent ?? NaN}
        sparklineData={kpi?.costPrediction.sparkline ?? []}
        subtitle={subtitle}
      />
      <KPICard
        title={`${prefix}${t.profitForecastKPI}`}
        value={kpi ? `¥${formatLargeNumber(kpi.profitPrediction.value)}` : '--'}
        changePercent={kpi?.profitPrediction.changePercent ?? NaN}
        sparklineData={kpi?.profitPrediction.sparkline ?? []}
        highlighted
        subtitle={subtitle}
      />
      <KPICard
        title={t.profitMarginForecast}
        value={kpi ? formatPercent(kpi.profitMargin.value) : '--'}
        changePercent={kpi?.profitMargin.changePercent ?? NaN}
        sparklineData={kpi?.profitMargin.sparkline ?? []}
        highlighted
        subtitle={subtitle}
      />
    </div>
  );
};

export default KPICardRow;

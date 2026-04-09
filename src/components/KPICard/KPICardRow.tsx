import { useKPIData } from '../../hooks/useDashboardData';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatLargeNumber, formatPercent } from '../../utils/formatters';
import { getPeriodLabel } from '../../utils/timeAggregation';
import KPICard from './KPICard';
import styles from './KPICardRow.module.css';

const GRANULARITY_LABELS: Record<string, string> = {
  day: '每日',
  week: '每周',
  month: '每月',
};

const KPICardRow = () => {
  const { data, isLoading, isError } = useKPIData();
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const dateRange = useDashboardStore((s) => s.filters.dateRange);
  const prefix = GRANULARITY_LABELS[timeGranularity] ?? '每日';

  // 非日粒度下显示统计周期副标题
  const subtitle =
    timeGranularity !== 'day'
      ? getPeriodLabel(timeGranularity, dateRange[1])
      : undefined;

  if (isLoading) {
    return <div className={styles.loading}>指标数据加载中...</div>;
  }

  if (isError) {
    return <div className={styles.error}>指标数据加载失败</div>;
  }

  const kpi = data;

  return (
    <div className={styles.row}>
      <KPICard
        title={`${prefix}可确认收入预测`}
        value={kpi ? `¥${formatLargeNumber(kpi.confirmedRevenue.value)}` : '--'}
        changePercent={kpi?.confirmedRevenue.changePercent ?? NaN}
        sparklineData={kpi?.confirmedRevenue.sparkline ?? []}
        highlighted
        subtitle={subtitle}
      />
      <KPICard
        title="觅睿销售额预测"
        value={kpi ? `¥${formatLargeNumber(kpi.meariSales.value)}` : '--'}
        changePercent={kpi?.meariSales.changePercent ?? NaN}
        sparklineData={kpi?.meariSales.sparkline ?? []}
        subtitle={subtitle}
      />
      <KPICard
        title={`${prefix}成本预测`}
        value={kpi ? `¥${formatLargeNumber(kpi.costPrediction.value)}` : '--'}
        changePercent={kpi?.costPrediction.changePercent ?? NaN}
        sparklineData={kpi?.costPrediction.sparkline ?? []}
        subtitle={subtitle}
      />
      <KPICard
        title={`${prefix}利润预测`}
        value={kpi ? `¥${formatLargeNumber(kpi.profitPrediction.value)}` : '--'}
        changePercent={kpi?.profitPrediction.changePercent ?? NaN}
        sparklineData={kpi?.profitPrediction.sparkline ?? []}
        highlighted
        subtitle={subtitle}
      />
      <KPICard
        title="利润率预测"
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

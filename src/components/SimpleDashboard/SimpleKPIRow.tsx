import { useMemo } from 'react';
import { useSimpleKPI } from '../../hooks/useSimpleDashboardData';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatLargeNumber } from '../../utils/formatters';
import { useI18n } from '../../i18n/I18nContext';
import KPICard from '../KPICard/KPICard';
import styles from '../KPICard/KPICardRow.module.css';

const SimpleKPIRow: React.FC = () => {
  const { t } = useI18n();
  const { data, isLoading, isError } = useSimpleKPI();
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);

  const prefix = useMemo(() => {
    if (timeGranularity === 'month') return t.granMonthly;
    return t.granDaily;
  }, [timeGranularity, t]);

  // 月粒度副标题：订单金额=统计到昨天，其他=预估整月
  const { orderSubtitle, estimateSubtitle } = useMemo(() => {
    if (timeGranularity !== 'month') return { orderSubtitle: undefined, estimateSubtitle: undefined };
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-indexed
    const mm = String(m + 1).padStart(2, '0');
    const firstDay = `${mm}-01`;
    // 自然月最近一天-1 = 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yd = String(yesterday.getDate()).padStart(2, '0');
    const ym = String(yesterday.getMonth() + 1).padStart(2, '0');
    const orderSub = `统计：${firstDay} ~ ${ym}-${yd}`;
    // 整月最后一天
    const lastDay = new Date(y, m + 1, 0).getDate();
    const estSub = `预估整月：${firstDay} ~ ${mm}-${String(lastDay).padStart(2, '0')}`;
    return { orderSubtitle: orderSub, estimateSubtitle: estSub };
  }, [timeGranularity]);

  if (isLoading) return <div className={styles.loading}>{t.loading}</div>;
  if (isError) return <div className={styles.error}>{t.loadFailed}</div>;

  return (
    <div className={styles.row} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      <KPICard
        title={`${prefix}${t.orderAmount}`}
        value={data ? `¥${formatLargeNumber(data.orderAmount.value)}` : '--'}
        changePercent={data?.orderAmount.changePercent ?? NaN}
        sparklineData={data?.orderAmount.sparkline ?? []}
        subtitle={orderSubtitle}
      />
      <KPICard
        title={`${prefix}${t.meariSalesForecast2}`}
        value={data ? `¥${formatLargeNumber(data.meariSales.value)}` : '--'}
        changePercent={data?.meariSales.changePercent ?? NaN}
        sparklineData={data?.meariSales.sparkline ?? []}
        subtitle={estimateSubtitle}
      />
      <KPICard
        title={`${prefix}${t.confirmedRevForecast2}`}
        value={data ? `¥${formatLargeNumber(data.confirmedRevenue.value)}` : '--'}
        changePercent={data?.confirmedRevenue.changePercent ?? NaN}
        sparklineData={data?.confirmedRevenue.sparkline ?? []}
        highlighted
        subtitle={estimateSubtitle}
      />
      <KPICard
        title={`${prefix}${t.newMonthConfirmedForecast}`}
        value={data ? `¥${formatLargeNumber(data.newMonthConfirmed.value)}` : '--'}
        changePercent={data?.newMonthConfirmed.changePercent ?? NaN}
        sparklineData={data?.newMonthConfirmed.sparkline ?? []}
        subtitle={estimateSubtitle}
      />
    </div>
  );
};

export default SimpleKPIRow;

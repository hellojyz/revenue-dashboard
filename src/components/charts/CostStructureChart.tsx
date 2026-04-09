import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useCostStructureData } from '../../hooks/useDashboardData';
import { buildCostStructureOption } from '../../utils/chartHelpers';
import { formatCurrency } from '../../utils/formatters';
import styles from './ChartCard.module.css';

const COLORS = {
  serverCost: '#f97583',
  trafficCost: '#f0883e',
  textSecondary: '#8b949e',
};

const GRANULARITY_SUBTITLE: Record<string, string> = {
  week: '近8周趋势',
  month: '近6个月趋势',
};

const CostStructureChart: React.FC = () => {
  const drillDownDate = useDashboardStore((s) => s.drillDownDate);
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const { data, isLoading, isError, refetch } = useCostStructureData();

  // 日粒度下：服务器成本和流量成本只有月度数据，展示月度汇总卡片
  const isDailyGranularity = timeGranularity === 'day';

  // 日粒度下过滤掉服务器成本和流量成本，只保留有日维度的成本项
  const filteredData = isDailyGranularity && data ? {
    ...data,
    serverCost: data.serverCost.map(() => 0),
    trafficCost: data.trafficCost.map(() => 0),
    trafficCost4G: data.trafficCost4G.map(() => 0),
    cardFeeCost: data.cardFeeCost.map(() => 0),
  } : data;

  const option = buildCostStructureOption(filteredData, data?.dateRanges);

  // If a drillDownDate is set, highlight that date on the chart via markLine
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

  // 计算月度汇总值（用于日粒度下展示）
  const serverCostMonthly = data?.serverCost?.reduce((a, b) => a + b, 0) ?? 0;
  const trafficCost4GMonthly = data?.trafficCost4G?.reduce((a, b) => a + b, 0) ?? 0;
  const cardFeeCostMonthly = data?.cardFeeCost?.reduce((a, b) => a + b, 0) ?? 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        成本结构趋势
        {isDailyGranularity && <span style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 }}>（日粒度下服务器/流量成本按月汇总展示）</span>}
        {GRANULARITY_SUBTITLE[timeGranularity] && <span style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 }}>（{GRANULARITY_SUBTITLE[timeGranularity]}）</span>}
      </div>
      {isLoading && (
        <div className={styles.statusContainer}>加载中...</div>
      )}
      {isError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>数据加载失败</span>
          <button className={styles.retryButton} onClick={() => refetch()}>
            重试
          </button>
        </div>
      )}
      {!isLoading && !isError && (!data || !data.dates?.length) && (
        <div className={styles.statusContainer}>暂无数据</div>
      )}
      {!isLoading && !isError && data && data.dates?.length > 0 && (
        <>
          {isDailyGranularity && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 6, padding: '10px 14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>服务器成本（月度汇总）</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.serverCost }}>{formatCurrency(serverCostMonthly)}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 6, padding: '10px 14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>4G卡流量（月度汇总）</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f0883e' }}>{formatCurrency(trafficCost4GMonthly)}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 6, padding: '10px 14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>4G卡费（月度汇总）</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#d4a373' }}>{formatCurrency(cardFeeCostMonthly)}</div>
              </div>
            </div>
          )}
          <div className={styles.chartArea}>
            <ReactECharts
              option={option}
              style={{ width: '100%', height: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CostStructureChart;

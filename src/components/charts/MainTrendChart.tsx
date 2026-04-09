import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useMainTrendData } from '../../hooks/useDashboardData';
import { buildMainTrendOption } from '../../utils/chartHelpers';
import { formatPercent } from '../../utils/formatters';
import styles from './ChartCard.module.css';

const GRANULARITY_SUBTITLE: Record<string, string> = {
  week: '近8周趋势',
  month: '近6个月趋势',
};

const MainTrendChart: React.FC = () => {
  const drillDownDate = useDashboardStore((s) => s.drillDownDate);
  const setDrillDownDate = useDashboardStore((s) => s.setDrillDownDate);
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const { data, isLoading, isError, refetch } = useMainTrendData();

  const option = buildMainTrendOption(data, data?.dateRanges);

  // 计算利润率均值和趋势方向
  const profitMarginInfo = useMemo(() => {
    if (!data?.profitMargin?.length) return null;
    const arr = data.profitMargin;
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    // 趋势：比较后半段均值与前半段均值
    const mid = Math.floor(arr.length / 2);
    const firstHalf = arr.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
    const secondHalf = arr.slice(mid).reduce((s, v) => s + v, 0) / (arr.length - mid);
    const trend = secondHalf > firstHalf + 0.5 ? 'up' : secondHalf < firstHalf - 0.5 ? 'down' : 'neutral';
    return { avg, trend };
  }, [data?.profitMargin]);

  const handleClick = (params: { name?: string }) => {
    if (!params.name) return;
    setDrillDownDate(drillDownDate === params.name ? null : params.name);
  };

  const trendIcon = profitMarginInfo?.trend === 'up' ? '↑' : profitMarginInfo?.trend === 'down' ? '↓' : '→';
  const trendClass = profitMarginInfo?.trend === 'up'
    ? styles.profitMarginTrendUp
    : profitMarginInfo?.trend === 'down'
      ? styles.profitMarginTrendDown
      : styles.profitMarginTrendNeutral;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitleRow}>
        <div className={styles.chartTitle} style={{ marginBottom: 0 }}>
          收入·成本·利润 主趋势分析
          {GRANULARITY_SUBTITLE[timeGranularity] && (
            <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8, fontWeight: 400 }}>
              （{GRANULARITY_SUBTITLE[timeGranularity]}）
            </span>
          )}
        </div>
        {profitMarginInfo && (
          <div className={styles.profitMarginIndicator}>
            <span className={styles.profitMarginLabel}>利润率均值</span>
            <span className={styles.profitMarginValue}>
              {formatPercent(profitMarginInfo.avg / 100)}
            </span>
            <span className={`${styles.profitMarginTrend} ${trendClass}`}>
              {trendIcon}
            </span>
          </div>
        )}
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
        <div className={styles.chartArea}>
          <ReactECharts
            option={option}
            style={{ width: '100%', height: '100%' }}
            onEvents={{ click: handleClick }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      )}
    </div>
  );
};

export default MainTrendChart;

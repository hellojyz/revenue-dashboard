import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useRevenueForecastV2Data } from '../../hooks/useDashboardData';
import { buildRevenueForecastV2Option } from '../../utils/chartHelpers';
import styles from './ChartCard.module.css';

const GRANULARITY_SUBTITLE: Record<string, string> = {
  week: '近8周趋势',
  month: '近6个月趋势',
};

const RevenueForecastV2Chart: React.FC = () => {
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const { data, isLoading, isError, refetch } = useRevenueForecastV2Data();

  const option = buildRevenueForecastV2Option(data, data?.dateRanges);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        收入预测分析 — 跨期确认 vs 当月新增
        {GRANULARITY_SUBTITLE[timeGranularity] && (
          <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8 }}>
            （{GRANULARITY_SUBTITLE[timeGranularity]}）
          </span>
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
            opts={{ renderer: 'canvas' }}
          />
        </div>
      )}
    </div>
  );
};

export default RevenueForecastV2Chart;

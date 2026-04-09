import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useWaterfallData } from '../../hooks/useDashboardData';
import { buildWaterfallOption } from '../../utils/chartHelpers';
import styles from './ChartCard.module.css';

const WaterfallChart: React.FC = () => {
  const drillDownDate = useDashboardStore((s) => s.drillDownDate);
  const { data, isLoading, isError, refetch } = useWaterfallData();

  const option = buildWaterfallOption(data);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        利润瀑布图{drillDownDate ? ` — ${drillDownDate}` : ''}
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
      {!isLoading && !isError && !data && (
        <div className={styles.statusContainer}>暂无数据</div>
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

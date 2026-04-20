import { useDeviceKPIData } from '../../hooks/useDeviceData';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingState from '../common/LoadingState';
import DeviceFilterBar from './DeviceFilterBar';
import DeviceKPIRow from './DeviceKPIRow';
import DeviceTrendGrid from './DeviceTrendGrid';
import DeviceDistributionChart from './DeviceDistributionChart';
import DeviceTopicEntries from './DeviceTopicEntries';
import styles from './DeviceDashboardPage.module.css';

function formatUpdatedAt(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `数据更新时间：${y}-${m}-${day} ${h}:${min}`;
}

export default function DeviceDashboardPage() {
  const { data, isLoading, isError, refetch } = useDeviceKPIData();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <span>数据加载失败，请稍后重试</span>
          <button className={styles.retryBtn} onClick={() => refetch()}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 第1行：标题区 */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>一级驾驶舱（设备域）</h1>
          <span className={styles.subtitle}>面向设备负责人 · 结果监控 + 健康解释护栏</span>
        </div>
        {data?.updatedAt && (
          <span className={styles.updatedAt}>{formatUpdatedAt(data.updatedAt)}</span>
        )}
      </div>

      {/* 第2行：筛选器 */}
      <ErrorBoundary>
        <DeviceFilterBar />
      </ErrorBoundary>

      {/* 第3行：KPI卡片 */}
      <ErrorBoundary>
        <DeviceKPIRow />
      </ErrorBoundary>

      {/* 第4-5行：趋势图 2x2 */}
      <ErrorBoundary>
        <DeviceTrendGrid />
      </ErrorBoundary>

      {/* 第6行：分布图 + 专题入口 */}
      <div className={styles.bottomRow}>
        <ErrorBoundary>
          <DeviceDistributionChart />
        </ErrorBoundary>
        <ErrorBoundary>
          <DeviceTopicEntries />
        </ErrorBoundary>
      </div>
    </div>
  );
}

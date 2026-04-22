import { useDeviceKPIData } from '../../hooks/useDeviceData';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingState from '../common/LoadingState';
import DeviceFilterBar from './DeviceFilterBar';
import DeviceKPIRow from './DeviceKPIRow';
import DeviceTrendGrid from './DeviceTrendGrid';
import DeviceRealtimePanel from './DeviceRealtimePanel';
import styles from './DeviceDashboardPage.module.css';

function formatUpdatedAt(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `统计截止：${y}-${m}-${day} ${h}:${min}`;
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
      {/* 标题区 */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>一级驾驶舱（设备域）</h1>
          <span className={styles.subtitle}>面向设备负责人 · 结果监控 + 健康解释护栏</span>
        </div>
        <div className={styles.headerRight}>
          {data?.updatedAt && (
            <span className={styles.updatedAt}>{formatUpdatedAt(data.updatedAt)}</span>
          )}
          <span className={styles.realtimeNote}>右侧实时数据每5分钟自动刷新</span>
        </div>
      </div>

      {/* 全局筛选器 */}
      <ErrorBoundary>
        <DeviceFilterBar />
      </ErrorBoundary>

      {/* KPI卡片行（截面快照，取截止日） */}
      <ErrorBoundary>
        <DeviceKPIRow />
      </ErrorBoundary>

      {/* 左右分栏主体 */}
      <div className={styles.mainLayout}>
        {/* 左侧：历史分析区（A类模块，受全局时间控制） */}
        <div className={styles.leftPanel}>
          <div className={styles.panelLabel}>
            <span className={styles.panelLabelText}>历史分析区</span>
            <span className={styles.panelLabelHint}>受全局时间范围 / 粒度控制</span>
          </div>
          <ErrorBoundary>
            <DeviceTrendGrid />
          </ErrorBoundary>
        </div>

        {/* 右侧：独立监控区（B/C类模块，不受全局时间范围控制） */}
        <div className={styles.rightPanel}>
          <div className={styles.panelLabel}>
            <span className={styles.panelLabelText}>实时监控区</span>
            <span className={styles.panelLabelHint}>独立时间 · 继承业务筛选</span>
          </div>
          <ErrorBoundary>
            <DeviceRealtimePanel />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

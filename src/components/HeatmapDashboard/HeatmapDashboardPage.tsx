import { useMemo } from 'react';
import { useHeatmapStore } from '../../store/useHeatmapStore';
import { useHeatmapData } from '../../hooks/useHeatmapData';
import HeatmapFilterBar from './HeatmapFilterBar';
import HeatmapAlertMonitor from './HeatmapAlertMonitor';
import HeatmapChart from './HeatmapChart';
import HeatmapDetailTable from './HeatmapDetailTable';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';
import styles from './HeatmapDashboardPage.module.css';

function formatUpdatedAt(isoStr: string | null): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `数据更新时间：${y}-${m}-${day} ${h}:${min}`;
}

export default function HeatmapDashboardPage() {
  const filters = useHeatmapStore((s) => s.filters);
  const { data, isLoading, isError, updatedAt } = useHeatmapData();

  const apps = useMemo(() => data?.apps ?? [], [data]);

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
        <ErrorBoundary>
          <div>数据加载失败，请稍后重试</div>
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>APP核心指标热力图看板</div>
      {updatedAt && <div className={styles.updatedAt}>{formatUpdatedAt(updatedAt)}</div>}

      <div className={styles.modules}>
        <ErrorBoundary>
          <HeatmapFilterBar />
        </ErrorBoundary>

        {apps.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ErrorBoundary>
              <HeatmapAlertMonitor data={apps} filters={filters} />
            </ErrorBoundary>

            <ErrorBoundary>
              <HeatmapChart data={apps} />
            </ErrorBoundary>

            <ErrorBoundary>
              <HeatmapDetailTable data={apps} />
            </ErrorBoundary>
          </>
        )}
      </div>
    </div>
  );
}

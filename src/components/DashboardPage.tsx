import FilterBar from './FilterBar/FilterBar';
import KPICardRow from './KPICard/KPICardRow';
import MainTrendChart from './charts/MainTrendChart';
import RevenueForecastV2Chart from './charts/RevenueForecastV2Chart';
import CostStructureChart from './charts/CostStructureChart';
import RevenueStructureChart from './charts/RevenueStructureChart';
import WaterfallChart from './charts/WaterfallChart';
import PackageProfitRanking from './charts/PackageProfitRanking';
import CostDetailCharts from './charts/CostDetailCharts';
import AlertMonitor from './AlertMonitor/AlertMonitor';
import ErrorBoundary from './common/ErrorBoundary';
import { useI18n } from '../i18n/I18nContext';
import styles from './DashboardPage.module.css';

/**
 * DashboardPage 主页面布局组件
 * 按视觉优先级排列模块，适配 1920px 及以上宽屏布局
 * 每个图表组件使用 ErrorBoundary 包裹
 */
const DashboardPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>{t.dashboardTitle}</h1>
      <p className={styles.pageSubtitle}>
        {t.dashboardSubtitle}
      </p>

      {/* FilterBar */}
      <ErrorBoundary fallbackTitle={t.filterBarError}>
        <FilterBar />
      </ErrorBoundary>

      <div className={styles.content}>
        {/* KPICardRow */}
        <ErrorBoundary fallbackTitle={t.kpiError}>
          <KPICardRow />
        </ErrorBoundary>

        {/* MainTrendChart - 最高优先级 */}
        <div className={styles.mainTrendSection}>
          <ErrorBoundary fallbackTitle={t.mainTrendError}>
            <MainTrendChart />
          </ErrorBoundary>
        </div>

        {/* RevenueForecastV2Chart - 收入预测分析看板2 */}
        <div className={styles.mainTrendSection}>
          <ErrorBoundary fallbackTitle={t.revForecastError}>
            <RevenueForecastV2Chart />
          </ErrorBoundary>
        </div>

        {/* CostStructureChart + RevenueStructureChart 并排 */}
        <div className={styles.twoColumns}>
          <ErrorBoundary fallbackTitle={t.costStructError}>
            <CostStructureChart />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle={t.revStructError}>
            <RevenueStructureChart />
          </ErrorBoundary>
        </div>

        {/* WaterfallChart + PackageProfitRanking 并排 */}
        <div className={styles.twoColumns}>
          <ErrorBoundary fallbackTitle={t.waterfallError}>
            <WaterfallChart />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle={t.pkgRankError}>
            <PackageProfitRanking />
          </ErrorBoundary>
        </div>

        {/* CostDetailCharts 全宽 */}
        <ErrorBoundary fallbackTitle={t.costDetailError}>
          <CostDetailCharts />
        </ErrorBoundary>

        {/* AlertMonitor 全宽 */}
        <ErrorBoundary fallbackTitle={t.alertError}>
          <AlertMonitor />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default DashboardPage;

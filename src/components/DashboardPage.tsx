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
import styles from './DashboardPage.module.css';

/**
 * DashboardPage 主页面布局组件
 * 按视觉优先级排列模块，适配 1920px 及以上宽屏布局
 * 每个图表组件使用 ErrorBoundary 包裹
 */
const DashboardPage: React.FC = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>可确认收入&amp;利润预测经营看板</h1>
      <p className={styles.pageSubtitle}>
        说明：本看板中的销售额预测反映订单成交规模预测；可确认收入预测反映基于服务生效与确认规则，在当前统计周期预计可确认为收入的金额。由于增值类服务存在跨期确认特性，可确认收入预测不等于销售额预测。
      </p>

      {/* FilterBar */}
      <ErrorBoundary fallbackTitle="筛选栏加载异常">
        <FilterBar />
      </ErrorBoundary>

      <div className={styles.content}>
        {/* KPICardRow */}
        <ErrorBoundary fallbackTitle="指标卡加载异常">
          <KPICardRow />
        </ErrorBoundary>

        {/* MainTrendChart - 最高优先级 */}
        <div className={styles.mainTrendSection}>
          <ErrorBoundary fallbackTitle="主趋势图加载异常">
            <MainTrendChart />
          </ErrorBoundary>
        </div>

        {/* RevenueForecastV2Chart - 收入预测分析看板2 */}
        <div className={styles.mainTrendSection}>
          <ErrorBoundary fallbackTitle="收入预测分析看板2加载异常">
            <RevenueForecastV2Chart />
          </ErrorBoundary>
        </div>

        {/* CostStructureChart + RevenueStructureChart 并排 */}
        <div className={styles.twoColumns}>
          <ErrorBoundary fallbackTitle="成本结构图加载异常">
            <CostStructureChart />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="收入结构图加载异常">
            <RevenueStructureChart />
          </ErrorBoundary>
        </div>

        {/* WaterfallChart + PackageProfitRanking 并排 */}
        <div className={styles.twoColumns}>
          <ErrorBoundary fallbackTitle="瀑布图加载异常">
            <WaterfallChart />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="套餐排行图加载异常">
            <PackageProfitRanking />
          </ErrorBoundary>
        </div>

        {/* CostDetailCharts 全宽 */}
        <ErrorBoundary fallbackTitle="成本专项分析加载异常">
          <CostDetailCharts />
        </ErrorBoundary>

        {/* AlertMonitor 全宽 */}
        <ErrorBoundary fallbackTitle="异常监控加载异常">
          <AlertMonitor />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default DashboardPage;

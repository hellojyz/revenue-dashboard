import SimpleFilterBar from './SimpleFilterBar';
import SimpleKPIRow from './SimpleKPIRow';
import SimpleMainTrendChart from './SimpleMainTrendChart';
import SimpleCrossPeriodChart from './SimpleCrossPeriodChart';
import SimpleNewMonthPkgChart from './SimpleNewMonthPkgChart';
import SimpleCollectionCharts from './SimpleCollectionCharts';
import SimpleAlertMonitor from './SimpleAlertMonitor';
import ErrorBoundary from '../common/ErrorBoundary';
import { useI18n } from '../../i18n/I18nContext';
import styles from '../DashboardPage.module.css';

const SimpleDashboardPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>{t.simpleDashboardTitle}</h1>
      <p className={styles.pageSubtitle}>{t.simpleDashboardSubtitle}</p>

      <ErrorBoundary fallbackTitle={t.filterBarError}>
        <SimpleFilterBar />
      </ErrorBoundary>

      <div className={styles.content}>
        <ErrorBoundary fallbackTitle={t.kpiError}>
          <SimpleKPIRow />
        </ErrorBoundary>

        <div className={styles.mainTrendSection}>
          <ErrorBoundary fallbackTitle={t.mainTrendError}>
            <SimpleMainTrendChart />
          </ErrorBoundary>
        </div>

        <div className={styles.mainTrendSection}>
          <ErrorBoundary fallbackTitle={t.revForecastError}>
            <SimpleCrossPeriodChart />
          </ErrorBoundary>
        </div>

        <ErrorBoundary fallbackTitle={t.revForecastError}>
          <SimpleNewMonthPkgChart />
        </ErrorBoundary>

        <ErrorBoundary fallbackTitle={t.revForecastError}>
          <SimpleCollectionCharts />
        </ErrorBoundary>

        <ErrorBoundary fallbackTitle={t.alertError}>
          <SimpleAlertMonitor />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default SimpleDashboardPage;

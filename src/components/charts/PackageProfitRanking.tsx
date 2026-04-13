import { useState, useMemo } from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { usePackageRankingData } from '../../hooks/useDashboardData';
import { buildPackageRankingOption } from '../../utils/chartHelpers';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useI18n } from '../../i18n/I18nContext';
import styles from './ChartCard.module.css';

type Dimension = 'productType' | 'packageVersion';
type Metric = 'profit' | 'profitMargin' | 'revenue' | 'cost';

const PackageProfitRanking: React.FC = () => {
  const { t } = useI18n();
  const [dimension, setDimension] = useState<Dimension>('productType');
  const [metric, setMetric] = useState<Metric>('profit');

  const drillDownProduct = useDashboardStore((s) => s.drillDownProduct);
  const setDrillDownProduct = useDashboardStore((s) => s.setDrillDownProduct);

  const { data, isLoading, isError, refetch } = usePackageRankingData(dimension, metric);

  const items = data?.items;
  const option = buildPackageRankingOption(items, metric);

  const summary = useMemo(() => {
    if (!items || items.length === 0) return null;
    const topProfit = [...items].sort((a, b) => b.profit - a.profit)[0];
    const topMargin = [...items].sort((a, b) => b.profitMargin - a.profitMargin)[0];
    return { topProfit, topMargin };
  }, [items]);

  const handleClick = (params: { name?: string }) => {
    if (!params.name) return;
    setDrillDownProduct(drillDownProduct === params.name ? null : params.name);
  };

  const handleDimensionChange = (e: RadioChangeEvent) => {
    setDimension(e.target.value as Dimension);
  };

  const handleMetricChange = (e: RadioChangeEvent) => {
    setMetric(e.target.value as Metric);
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>{t.pkgRankTitle}</div>

      {/* 摘要卡片 */}
      {summary && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCardLabel}>{t.topProfitLabel}</span>
            <span className={styles.summaryCardName}>{summary.topProfit.name}</span>
            <span className={`${styles.summaryCardValue} ${styles.summaryCardValueProfit}`}>
              {formatCurrency(summary.topProfit.profit)}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCardLabel}>{t.topMarginLabel}</span>
            <span className={styles.summaryCardName}>{summary.topMargin.name}</span>
            <span className={`${styles.summaryCardValue} ${styles.summaryCardValueMargin}`}>
              {formatPercent(summary.topMargin.profitMargin)}
            </span>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <span className={styles.controlLabel}>{t.dimension}</span>
        <Radio.Group
          value={dimension}
          onChange={handleDimensionChange}
          size="small"
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: t.productType, value: 'productType' },
            { label: t.packageVersion2, value: 'packageVersion' },
          ]}
        />
        <span className={styles.controlLabel}>{t.metric}</span>
        <Radio.Group
          value={metric}
          onChange={handleMetricChange}
          size="small"
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: t.profitAmount, value: 'profit' },
            { label: t.profitMargin, value: 'profitMargin' },
            { label: t.revenueMetric, value: 'revenue' },
            { label: t.costMetric, value: 'cost' },
          ]}
        />
      </div>
      {isLoading && (
        <div className={styles.statusContainer}>{t.loading}</div>
      )}
      {isError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{t.loadFailed}</span>
          <button className={styles.retryButton} onClick={() => refetch()}>
            {t.retry}
          </button>
        </div>
      )}
      {!isLoading && !isError && (!items || items.length === 0) && (
        <div className={styles.statusContainer}>{t.noData}</div>
      )}
      {!isLoading && !isError && items && items.length > 0 && (
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

export default PackageProfitRanking;

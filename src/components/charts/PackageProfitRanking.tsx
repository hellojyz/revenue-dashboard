import { useState, useMemo } from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { usePackageRankingData } from '../../hooks/useDashboardData';
import { buildPackageRankingOption } from '../../utils/chartHelpers';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import styles from './ChartCard.module.css';

type Dimension = 'productType' | 'packageVersion';
type Metric = 'profit' | 'profitMargin' | 'revenue' | 'cost';

const PackageProfitRanking: React.FC = () => {
  const [dimension, setDimension] = useState<Dimension>('productType');
  const [metric, setMetric] = useState<Metric>('profit');

  const drillDownProduct = useDashboardStore((s) => s.drillDownProduct);
  const setDrillDownProduct = useDashboardStore((s) => s.setDrillDownProduct);

  const { data, isLoading, isError, refetch } = usePackageRankingData(dimension, metric);

  const items = data?.items;
  const option = buildPackageRankingOption(items, metric);

  // 计算摘要：利润额最优 & 利润率最优
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
      <div className={styles.chartTitle}>套餐盈利能力预测排行 — 识别最赚钱的套餐产品</div>

      {/* 摘要卡片 */}
      {summary && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCardLabel}>利润额预测最优</span>
            <span className={styles.summaryCardName}>{summary.topProfit.name}</span>
            <span className={`${styles.summaryCardValue} ${styles.summaryCardValueProfit}`}>
              {formatCurrency(summary.topProfit.profit)}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCardLabel}>利润率预测最优</span>
            <span className={styles.summaryCardName}>{summary.topMargin.name}</span>
            <span className={`${styles.summaryCardValue} ${styles.summaryCardValueMargin}`}>
              {formatPercent(summary.topMargin.profitMargin)}
            </span>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <span className={styles.controlLabel}>维度</span>
        <Radio.Group
          value={dimension}
          onChange={handleDimensionChange}
          size="small"
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: '产品类型', value: 'productType' },
            { label: '套餐版本', value: 'packageVersion' },
          ]}
        />
        <span className={styles.controlLabel}>指标</span>
        <Radio.Group
          value={metric}
          onChange={handleMetricChange}
          size="small"
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: '利润额', value: 'profit' },
            { label: '利润率', value: 'profitMargin' },
            { label: '收入', value: 'revenue' },
            { label: '成本', value: 'cost' },
          ]}
        />
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
      {!isLoading && !isError && (!items || items.length === 0) && (
        <div className={styles.statusContainer}>暂无数据</div>
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

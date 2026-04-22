/**
 * 左侧历史分析区趋势图网格（A类模块）
 * 受全局时间范围/粒度/截止日控制
 * 在线稳定性趋势已移至右侧独立监控区
 */
import { useDeviceStore } from '../../store/useDeviceStore';
import ErrorBoundary from '../common/ErrorBoundary';
import DeviceScaleTrendChart from './DeviceScaleTrendChart';
import DevicePowerTrendChart from './DevicePowerTrendChart';
import DeviceAccessTrendChart from './DeviceAccessTrendChart';
import DeviceDistributionChart from './DeviceDistributionChart';
import styles from './DeviceTrendGrid.module.css';

export default function DeviceTrendGrid() {
  const highlightedChart = useDeviceStore((s) => s.highlightedChart);

  return (
    <div className={styles.grid}>
      {/* 规模-激活-活跃趋势（A类，全宽） */}
      <div className={styles.fullWidth}>
        <ErrorBoundary>
          <DeviceScaleTrendChart
            chartId="scale"
            isHighlighted={highlightedChart === 'scale'}
          />
        </ErrorBoundary>
      </div>
      {/* 供电健康 + 接入体验（A类，各半宽） */}
      <ErrorBoundary>
        <DevicePowerTrendChart
          chartId="power"
          isHighlighted={highlightedChart === 'power'}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <DeviceAccessTrendChart
          chartId="access"
          isHighlighted={highlightedChart === 'access'}
        />
      </ErrorBoundary>
      {/* 结构分布（B类，全宽） */}
      <div className={styles.fullWidth}>
        <ErrorBoundary>
          <DeviceDistributionChart />
        </ErrorBoundary>
      </div>
    </div>
  );
}

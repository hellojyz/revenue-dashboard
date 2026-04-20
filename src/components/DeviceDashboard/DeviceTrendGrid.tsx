import { useDeviceStore } from '../../store/useDeviceStore';
import ErrorBoundary from '../common/ErrorBoundary';
import DeviceScaleTrendChart from './DeviceScaleTrendChart';
import DeviceOnlineTrendChart from './DeviceOnlineTrendChart';
import DevicePowerTrendChart from './DevicePowerTrendChart';
import DeviceAccessTrendChart from './DeviceAccessTrendChart';
import styles from './DeviceTrendGrid.module.css';

export default function DeviceTrendGrid() {
  const highlightedChart = useDeviceStore((s) => s.highlightedChart);

  return (
    <div className={styles.grid}>
      <ErrorBoundary>
        <DeviceScaleTrendChart
          chartId="scale"
          isHighlighted={highlightedChart === 'scale'}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <DeviceOnlineTrendChart
          chartId="online"
          isHighlighted={highlightedChart === 'online'}
        />
      </ErrorBoundary>
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
    </div>
  );
}

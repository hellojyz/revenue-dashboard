import { useDeviceKPIData } from '../../hooks/useDeviceData';
import { useDeviceStore } from '../../store/useDeviceStore';
import { formatLargeNumber, formatPercent } from '../../utils/formatters';
import { getAlertLevel } from '../../utils/deviceThresholds';
import KPICard from '../KPICard/KPICard';
import LoadingState from '../common/LoadingState';
import styles from './DeviceKPIRow.module.css';

export default function DeviceKPIRow() {
  const { data, isLoading, isError } = useDeviceKPIData();
  const setHighlightedChart = useDeviceStore((s) => s.setHighlightedChart);
  const highlightedChart = useDeviceStore((s) => s.highlightedChart);

  if (isLoading) return <LoadingState rows={2} />;
  if (isError) return <div className={styles.error}>KPI数据加载失败</div>;

  const kpi = data;

  const onlineRateValue = kpi?.onlineRate.value ?? null;
  const churnRatioValue = kpi?.churnRatio.value ?? null;

  const onlineRateAlert = onlineRateValue !== null ? getAlertLevel('onlineRate', onlineRateValue) : null;
  const churnRatioAlert = churnRatioValue !== null ? getAlertLevel('churnRatio', churnRatioValue) : null;

  return (
    <div className={styles.row}>
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'scale' ? styles.highlighted : ''}`}
        onClick={() => setHighlightedChart('scale')}
      >
        <KPICard
          title="设备总数"
          value={kpi ? formatLargeNumber(kpi.totalDevices.value) : '--'}
          changePercent={kpi?.totalDevices.changePercent ?? NaN}
          sparklineData={kpi?.totalDevices.sparkline ?? []}
        />
      </div>
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'scale' ? styles.highlighted : ''}`}
        onClick={() => setHighlightedChart('scale')}
      >
        <KPICard
          title="激活设备数"
          value={kpi ? formatLargeNumber(kpi.activatedDevices.value) : '--'}
          changePercent={kpi?.activatedDevices.changePercent ?? NaN}
          sparklineData={kpi?.activatedDevices.sparkline ?? []}
        />
      </div>
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'scale' ? styles.highlighted : ''}`}
        onClick={() => setHighlightedChart('scale')}
      >
        <KPICard
          title="活跃设备数"
          value={kpi ? formatLargeNumber(kpi.activeDevices.value) : '--'}
          changePercent={kpi?.activeDevices.changePercent ?? NaN}
          sparklineData={kpi?.activeDevices.sparkline ?? []}
        />
      </div>
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'online' ? styles.highlighted : ''} ${onlineRateAlert === 'yellow' ? styles.alertYellow : ''}`}
        onClick={() => setHighlightedChart('online')}
      >
        <KPICard
          title="在线率"
          value={kpi ? formatPercent(kpi.onlineRate.value) : '--'}
          changePercent={kpi?.onlineRate.changePercent ?? NaN}
          sparklineData={kpi?.onlineRate.sparkline ?? []}
        />
      </div>
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'online' ? styles.highlighted : ''} ${churnRatioAlert === 'red' ? styles.alertRed : ''}`}
        onClick={() => setHighlightedChart('online')}
      >
        <KPICard
          title="流失占比"
          value={kpi ? formatPercent(kpi.churnRatio.value) : '--'}
          changePercent={kpi?.churnRatio.changePercent ?? NaN}
          sparklineData={kpi?.churnRatio.sparkline ?? []}
        />
      </div>
    </div>
  );
}

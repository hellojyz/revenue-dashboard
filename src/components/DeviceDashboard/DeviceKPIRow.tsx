import { useDeviceKPIData } from '../../hooks/useDeviceData';
import { useDeviceStore } from '../../store/useDeviceStore';
import { formatLargeNumber, formatPercent } from '../../utils/formatters';
import { getAlertLevel } from '../../utils/deviceThresholds';
import KPICard from '../KPICard/KPICard';
import LoadingState from '../common/LoadingState';
import styles from './DeviceKPIRow.module.css';

function formatYoy(yoy: number | null | undefined): string {
  if (yoy == null || isNaN(yoy)) return '';
  const sign = yoy >= 0 ? '+' : '';
  return `同比 ${sign}${(yoy * 100).toFixed(1)}%`;
}

export default function DeviceKPIRow() {
  const { data, isLoading, isError } = useDeviceKPIData();
  const setHighlightedChart = useDeviceStore((s) => s.setHighlightedChart);
  const highlightedChart = useDeviceStore((s) => s.highlightedChart);

  if (isLoading) return <LoadingState rows={2} />;
  if (isError) return <div className={styles.error}>KPI数据加载失败</div>;

  const kpi = data;

  // 活跃率 = 活跃设备数 / 激活设备数
  const activeRatio =
    kpi?.activeDevices.value && kpi?.activatedDevices.value
      ? kpi.activeDevices.value / kpi.activatedDevices.value
      : null;

  // 流失率趋势：用流失设备数 sparkline 展示
  const churnValue = kpi?.churnDevices.value ?? null;
  const churnChangePercent = kpi?.churnDevices.changePercent ?? NaN;

  const onlineRateValue = kpi?.onlineRate.value ?? null;
  const onlineRateAlert = onlineRateValue !== null ? getAlertLevel('onlineRate', onlineRateValue) : null;

  return (
    <div className={styles.row}>
      {/* 设备总数：本期值 + 环比 + 同比 */}
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'scale' ? styles.highlighted : ''}`}
        onClick={() => setHighlightedChart('scale')}
      >
        <KPICard
          title="设备总数"
          value={kpi ? formatLargeNumber(kpi.totalDevices.value) : '--'}
          changePercent={kpi?.totalDevices.changePercent ?? NaN}
          sparklineData={kpi?.totalDevices.sparkline ?? []}
          subtitle={formatYoy(kpi?.totalDevices.yoyPercent)}
        />
      </div>

      {/* 激活设备数：本期值 + 环比 + 同比 */}
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'scale' ? styles.highlighted : ''}`}
        onClick={() => setHighlightedChart('scale')}
      >
        <KPICard
          title="激活设备数"
          value={kpi ? formatLargeNumber(kpi.activatedDevices.value) : '--'}
          changePercent={kpi?.activatedDevices.changePercent ?? NaN}
          sparklineData={kpi?.activatedDevices.sparkline ?? []}
          subtitle={formatYoy(kpi?.activatedDevices.yoyPercent)}
        />
      </div>

      {/* 活跃设备数：本期值 + 活跃率 */}
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'scale' ? styles.highlighted : ''}`}
        onClick={() => setHighlightedChart('scale')}
      >
        <KPICard
          title="活跃设备数"
          value={kpi ? formatLargeNumber(kpi.activeDevices.value) : '--'}
          changePercent={kpi?.activeDevices.changePercent ?? NaN}
          sparklineData={kpi?.activeDevices.sparkline ?? []}
          subtitle={activeRatio !== null ? `活跃率 ${formatPercent(activeRatio)}` : ''}
        />
      </div>

      {/* 设备在线率 */}
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'online' ? styles.highlighted : ''} ${onlineRateAlert === 'yellow' ? styles.alertYellow : ''}`}
        onClick={() => setHighlightedChart('online')}
      >
        <KPICard
          title="设备在线率"
          value={kpi ? formatPercent(kpi.onlineRate.value) : '--'}
          changePercent={kpi?.onlineRate.changePercent ?? NaN}
          sparklineData={kpi?.onlineRate.sparkline ?? []}
        />
      </div>

      {/* 流失设备数：本期值 + 流失率趋势 */}
      <div
        className={`${styles.cardWrapper} ${highlightedChart === 'online' ? styles.highlighted : ''}`}
        onClick={() => setHighlightedChart('online')}
      >
        <KPICard
          title="流失设备数"
          value={churnValue !== null ? formatLargeNumber(churnValue) : '--'}
          changePercent={churnChangePercent}
          sparklineData={kpi?.churnDevices.sparkline ?? []}
          subtitle="流失率趋势"
        />
      </div>
    </div>
  );
}

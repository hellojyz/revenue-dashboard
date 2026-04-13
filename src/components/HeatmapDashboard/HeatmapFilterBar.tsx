import { useState, useCallback, useMemo } from 'react';
import { Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import { useHeatmapStore, defaultHeatmapFilters } from '../../store/useHeatmapStore';
import { APP_NAME_OPTIONS } from '../../utils/heatmapThresholds';
import { useI18n } from '../../i18n/I18nContext';
import type { HeatmapFilters, DeviceType, PackageType, TimePeriod } from '../../types/heatmap';
import styles from './HeatmapFilterBar.module.css';

const { RangePicker } = DatePicker;

export default function HeatmapFilterBar() {
  const { t } = useI18n();
  const commitFilters = useHeatmapStore((s) => s.commitFilters);
  const setPendingFilters = useHeatmapStore((s) => s.setPendingFilters);
  const resetFilters = useHeatmapStore((s) => s.resetFilters);
  const [local, setLocal] = useState<HeatmapFilters>({ ...defaultHeatmapFilters });

  const deviceTypeOptions = useMemo(() => [
    { value: 'all', label: t.all },
    { value: '4g_camera', label: t['4g_camera'] },
    { value: 'battery_camera', label: t.battery_camera },
    { value: 'wired_camera', label: t.wired_camera },
    { value: 'doorbell', label: t.doorbell },
    { value: 'light', label: t.light },
    { value: 'mini_camera', label: t.mini_camera },
  ], [t]);

  const packageTypeOptions = useMemo(() => [
    { value: 'all', label: t.all },
    { value: 'yearly', label: t.yearly },
    { value: 'monthly', label: t.monthly },
    { value: 'half_yearly', label: t.half_yearly },
    { value: 'quarterly', label: t.quarterly },
    { value: 'daily', label: t.dailyPkg },
  ], [t]);

  const timePeriodOptions = useMemo(() => [
    { value: 'last_7_days', label: t.last7days },
    { value: 'last_30_days', label: t.last30days },
    { value: 'natural_month', label: t.naturalMonth },
    { value: 'custom', label: t.custom },
  ], [t]);

  const handleAppName = useCallback((v: string) => setLocal((p) => ({ ...p, appName: v })), []);
  const handleDeviceType = useCallback((v: DeviceType) => setLocal((p) => ({ ...p, deviceType: v })), []);
  const handlePackageType = useCallback((v: PackageType) => setLocal((p) => ({ ...p, packageType: v })), []);
  const handleTimePeriod = useCallback((v: TimePeriod) => setLocal((p) => ({ ...p, timePeriod: v, customDateRange: v === 'custom' ? p.customDateRange : undefined })), []);
  const handleDateRange = useCallback((_: unknown, ds: [string, string]) => setLocal((p) => ({ ...p, customDateRange: ds })), []);
  const handleQuery = useCallback(() => { setPendingFilters(local); commitFilters(); }, [local, setPendingFilters, commitFilters]);
  const handleReset = useCallback(() => { setLocal({ ...defaultHeatmapFilters }); resetFilters(); }, [resetFilters]);

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>{t.app}</span>
        <Select value={local.appName} onChange={handleAppName} options={APP_NAME_OPTIONS} style={{ width: 160 }} showSearch optionFilterProp="label" />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>{t.deviceType}</span>
        <Select value={local.deviceType} onChange={handleDeviceType} options={deviceTypeOptions} style={{ width: 130 }} />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>{t.packageType}</span>
        <Select value={local.packageType} onChange={handlePackageType} options={packageTypeOptions} style={{ width: 120 }} />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>{t.timePeriod}</span>
        <Select value={local.timePeriod} onChange={handleTimePeriod} options={timePeriodOptions} style={{ width: 120 }} />
      </div>
      {local.timePeriod === 'custom' && (
        <div className={styles.filterItem}>
          <RangePicker value={local.customDateRange ? [dayjs(local.customDateRange[0]), dayjs(local.customDateRange[1])] : null} onChange={handleDateRange} disabledDate={(c) => c && c > dayjs().endOf('day')} />
        </div>
      )}
      <div className={styles.actions}>
        <Button type="primary" onClick={handleQuery}>{t.query}</Button>
        <Button onClick={handleReset}>{t.reset}</Button>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import { useHeatmapStore } from '../../store/useHeatmapStore';
import { defaultHeatmapFilters } from '../../store/useHeatmapStore';
import {
  DEVICE_TYPE_LABELS,
  PACKAGE_TYPE_LABELS,
  TIME_PERIOD_LABELS,
  APP_NAME_OPTIONS,
} from '../../utils/heatmapThresholds';
import type { HeatmapFilters, DeviceType, PackageType, TimePeriod } from '../../types/heatmap';
import styles from './HeatmapFilterBar.module.css';

const { RangePicker } = DatePicker;

const deviceTypeOptions = Object.entries(DEVICE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const packageTypeOptions = Object.entries(PACKAGE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const timePeriodOptions = Object.entries(TIME_PERIOD_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function HeatmapFilterBar() {
  const commitFilters = useHeatmapStore((s) => s.commitFilters);
  const setPendingFilters = useHeatmapStore((s) => s.setPendingFilters);
  const resetFilters = useHeatmapStore((s) => s.resetFilters);

  const [local, setLocal] = useState<HeatmapFilters>({ ...defaultHeatmapFilters });

  const handleAppName = useCallback((v: string) => {
    setLocal((prev) => ({ ...prev, appName: v }));
  }, []);

  const handleDeviceType = useCallback((v: DeviceType) => {
    setLocal((prev) => ({ ...prev, deviceType: v }));
  }, []);

  const handlePackageType = useCallback((v: PackageType) => {
    setLocal((prev) => ({ ...prev, packageType: v }));
  }, []);

  const handleTimePeriod = useCallback((v: TimePeriod) => {
    setLocal((prev) => ({
      ...prev,
      timePeriod: v,
      customDateRange: v === 'custom' ? prev.customDateRange : undefined,
    }));
  }, []);

  const handleDateRange = useCallback(
    (_: unknown, dateStrings: [string, string]) => {
      setLocal((prev) => ({ ...prev, customDateRange: dateStrings }));
    },
    [],
  );

  const handleQuery = useCallback(() => {
    setPendingFilters(local);
    commitFilters();
  }, [local, setPendingFilters, commitFilters]);

  const handleReset = useCallback(() => {
    setLocal({ ...defaultHeatmapFilters });
    resetFilters();
  }, [resetFilters]);

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>APP</span>
        <Select
          value={local.appName}
          onChange={handleAppName}
          options={APP_NAME_OPTIONS}
          style={{ width: 160 }}
          showSearch
          optionFilterProp="label"
        />
      </div>

      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>设备类型</span>
        <Select
          value={local.deviceType}
          onChange={handleDeviceType}
          options={deviceTypeOptions}
          style={{ width: 120 }}
        />
      </div>

      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>套餐类型</span>
        <Select
          value={local.packageType}
          onChange={handlePackageType}
          options={packageTypeOptions}
          style={{ width: 120 }}
        />
      </div>

      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>时间周期</span>
        <Select
          value={local.timePeriod}
          onChange={handleTimePeriod}
          options={timePeriodOptions}
          style={{ width: 120 }}
        />
      </div>

      {local.timePeriod === 'custom' && (
        <div className={styles.filterItem}>
          <RangePicker
            value={
              local.customDateRange
                ? [dayjs(local.customDateRange[0]), dayjs(local.customDateRange[1])]
                : null
            }
            onChange={handleDateRange}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </div>
      )}

      <div className={styles.actions}>
        <Button type="primary" onClick={handleQuery}>
          查询
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </div>
    </div>
  );
}

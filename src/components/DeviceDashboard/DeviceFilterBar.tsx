import { useState, useCallback } from 'react';
import { Select, Radio, Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useDeviceStore } from '../../store/useDeviceStore';
import type { DeviceFilters, TimeRange, PowerType } from '../../types/deviceDashboard';
import styles from './DeviceFilterBar.module.css';

const { RangePicker } = DatePicker;

const DEFAULT_FILTERS: DeviceFilters = {
  timeRange: 'last_12_months',
  region: [],
  channel: [],
  model: [],
  firmwareVersion: [],
  appVersion: [],
  powerType: [],
  lifecycleStage: [],
};

const TIME_RANGE_OPTIONS = [
  { value: 'last_12_months', label: '近12个月' },
  { value: 'last_6_months',  label: '近6个月' },
  { value: 'last_3_months',  label: '近3个月' },
  { value: 'custom',         label: '自定义' },
];

const REGION_OPTIONS = [
  { value: 'china',          label: '中国' },
  { value: 'north_america',  label: '北美' },
  { value: 'europe',         label: '欧洲' },
  { value: 'southeast_asia', label: '东南亚' },
  { value: 'other',          label: '其他' },
];

const CHANNEL_OPTIONS = [
  { value: 'online',   label: '线上' },
  { value: 'offline',  label: '线下' },
  { value: 'operator', label: '运营商' },
];

const MODEL_OPTIONS = [
  { value: 'camera_a', label: '摄像头A' },
  { value: 'camera_b', label: '摄像头B' },
  { value: 'doorbell', label: '门铃Pro' },
  { value: 'mini',     label: '室内Mini' },
];

const FIRMWARE_OPTIONS = [
  { value: 'v1.0', label: 'v1.0' },
  { value: 'v1.1', label: 'v1.1' },
  { value: 'v2.0', label: 'v2.0' },
];

const APP_VERSION_OPTIONS = [
  { value: '3.0', label: '3.0' },
  { value: '3.1', label: '3.1' },
  { value: '3.2', label: '3.2' },
];

const LIFECYCLE_OPTIONS = [
  { value: 'new',     label: '新品期' },
  { value: 'growth',  label: '成长期' },
  { value: 'mature',  label: '成熟期' },
  { value: 'decline', label: '衰退期' },
];

const POWER_TYPE_OPTIONS = [
  { value: 'all',       label: '全部' },
  { value: 'wired',     label: '常电' },
  { value: 'low_power', label: '低功耗' },
];

export default function DeviceFilterBar() {
  const setPendingFilters = useDeviceStore((s) => s.setPendingFilters);
  const commitFilters = useDeviceStore((s) => s.commitFilters);
  const resetFilters = useDeviceStore((s) => s.resetFilters);
  const [local, setLocal] = useState<DeviceFilters>({ ...DEFAULT_FILTERS });

  const handleTimeRange = useCallback((v: TimeRange) => {
    setLocal((p) => ({ ...p, timeRange: v, customDateRange: v === 'custom' ? p.customDateRange : undefined }));
  }, []);

  const handleDateRange = useCallback((_: unknown, ds: [string, string]) => {
    setLocal((p) => ({ ...p, customDateRange: ds }));
  }, []);

  const handlePowerType = useCallback((v: PowerType) => {
    setLocal((p) => ({ ...p, powerType: v === 'all' ? [] : [v] }));
  }, []);

  const handleQuery = useCallback(() => {
    setPendingFilters(local);
    commitFilters();
  }, [local, setPendingFilters, commitFilters]);

  const handleReset = useCallback(() => {
    setLocal({ ...DEFAULT_FILTERS });
    resetFilters();
  }, [resetFilters]);

  const currentPowerType: PowerType =
    local.powerType.length === 0 ? 'all' : (local.powerType[0] as PowerType);

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>时间范围</span>
        <Select
          value={local.timeRange}
          onChange={handleTimeRange}
          options={TIME_RANGE_OPTIONS}
          style={{ width: 120 }}
        />
      </div>
      {local.timeRange === 'custom' && (
        <div className={styles.filterItem}>
          <RangePicker
            value={
              local.customDateRange
                ? [dayjs(local.customDateRange[0]), dayjs(local.customDateRange[1])]
                : null
            }
            onChange={handleDateRange}
            disabledDate={(c) => c && c > dayjs().endOf('day')}
          />
        </div>
      )}
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>区域</span>
        <Select
          mode="multiple"
          value={local.region}
          onChange={(v) => setLocal((p) => ({ ...p, region: v }))}
          options={REGION_OPTIONS}
          style={{ minWidth: 120 }}
          placeholder="全部"
          maxTagCount={2}
        />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>渠道</span>
        <Select
          mode="multiple"
          value={local.channel}
          onChange={(v) => setLocal((p) => ({ ...p, channel: v }))}
          options={CHANNEL_OPTIONS}
          style={{ minWidth: 120 }}
          placeholder="全部"
          maxTagCount={2}
        />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>机型</span>
        <Select
          mode="multiple"
          value={local.model}
          onChange={(v) => setLocal((p) => ({ ...p, model: v }))}
          options={MODEL_OPTIONS}
          style={{ minWidth: 120 }}
          placeholder="全部"
          maxTagCount={2}
        />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>固件版本</span>
        <Select
          mode="multiple"
          value={local.firmwareVersion}
          onChange={(v) => setLocal((p) => ({ ...p, firmwareVersion: v }))}
          options={FIRMWARE_OPTIONS}
          style={{ minWidth: 100 }}
          placeholder="全部"
          maxTagCount={2}
        />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>APP版本</span>
        <Select
          mode="multiple"
          value={local.appVersion}
          onChange={(v) => setLocal((p) => ({ ...p, appVersion: v }))}
          options={APP_VERSION_OPTIONS}
          style={{ minWidth: 100 }}
          placeholder="全部"
          maxTagCount={2}
        />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>供电方式</span>
        <Radio.Group
          value={currentPowerType}
          onChange={(e) => handlePowerType(e.target.value as PowerType)}
          options={POWER_TYPE_OPTIONS}
          optionType="button"
          buttonStyle="solid"
          size="small"
        />
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>生命周期</span>
        <Select
          mode="multiple"
          value={local.lifecycleStage}
          onChange={(v) => setLocal((p) => ({ ...p, lifecycleStage: v }))}
          options={LIFECYCLE_OPTIONS}
          style={{ minWidth: 120 }}
          placeholder="全部"
          maxTagCount={2}
        />
      </div>
      <div className={styles.actions}>
        <Button type="primary" onClick={handleQuery}>查询</Button>
        <Button onClick={handleReset}>重置</Button>
      </div>
    </div>
  );
}

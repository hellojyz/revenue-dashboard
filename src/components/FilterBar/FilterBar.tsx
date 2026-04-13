import { useMemo } from 'react';
import { DatePicker, Radio, Select } from 'antd';
import type { RadioChangeEvent } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useDashboardStore } from '../../store/useDashboardStore';
import type { DashboardFilters } from '../../types/dashboard';
import { useI18n } from '../../i18n/I18nContext';
import styles from './FilterBar.module.css';

const { RangePicker } = DatePicker;

const PACKAGE_VERSION_OPTIONS = [
  { label: 'V0', value: 'v0' },
  { label: 'V1', value: 'v1' },
  { label: 'V2', value: 'v2' },
  { label: 'V3', value: 'v3' },
  { label: 'V4', value: 'v4' },
  { label: 'V5', value: 'v5' },
];

const SELECT_STYLE = { minWidth: 140 };

const SOURCE_APP_OPTIONS = [
  { label: 'iOS', value: 'iOS' },
  { label: 'Android', value: 'Android' },
  { label: 'Web', value: 'Web' },
  { label: 'H5', value: 'H5' },
];

const FACTORY_OPTIONS = [
  { label: '工厂A', value: '工厂A' },
  { label: '工厂B', value: '工厂B' },
  { label: '工厂C', value: '工厂C' },
];

const SELLER_OPTIONS = [
  { label: '卖家1', value: '卖家1' },
  { label: '卖家2', value: '卖家2' },
  { label: '卖家3', value: '卖家3' },
];

const TP_OPTIONS = [
  { label: 'TP1', value: 'TP1' },
  { label: 'TP2', value: 'TP2' },
  { label: 'TP3', value: 'TP3' },
];

const FilterBar: React.FC = () => {
  const { t } = useI18n();
  const { filters, setFilters } = useDashboardStore();

  const ORDER_TYPE_OPTIONS = useMemo(() => [
    { label: t.cloudStorage, value: 'cloud_storage' },
    { label: t.cloud4G, value: 'cloud_4g' },
    { label: t.fourG, value: '4g' },
    { label: t.ai, value: 'ai' },
    { label: t.cloudAI, value: 'cloud_ai' },
  ], [t]);

  const DEVICE_TYPE_OPTIONS = useMemo(() => [
    { label: t.batteryCamera, value: 'battery_camera' },
    { label: t.fourGCamera, value: '4g_camera' },
    { label: t.acCamera, value: 'ac_camera' },
    { label: t.doorbellDev, value: 'doorbell' },
  ], [t]);

  const PRODUCT_TYPE_OPTIONS = useMemo(() => [
    { label: t.yearlyPkg, value: 'yearly' },
    { label: t.monthlyPkg, value: 'monthly' },
    { label: t.quarterlyPkg, value: 'quarterly' },
    { label: t.dailyPkg2, value: 'daily' },
  ], [t]);

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        dateRange: [
          dates[0].format('YYYY-MM-DD'),
          dates[1].format('YYYY-MM-DD'),
        ],
      });
    }
  };

  const handleGranularityChange = (e: RadioChangeEvent) => {
    setFilters({
      timeGranularity: e.target.value as DashboardFilters['timeGranularity'],
    });
  };

  const handleMultiSelectChange = (
    field: keyof Pick<
      DashboardFilters,
      'orderTypes' | 'deviceTypes' | 'productTypes' | 'packageVersions' | 'sourceApps' | 'factories' | 'sellers' | 'tpList'
    >,
    values: string[],
  ) => {
    setFilters({ [field]: values });
  };

  return (
    <div className={styles.filterBar}>
      {/* 第一层：时间范围、时间粒度 */}
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.dateRange}</span>
          <RangePicker
            value={[dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]}
            onChange={handleDateRangeChange}
            allowClear={false}
            size="small"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.granularity}</span>
          <Radio.Group
            value={filters.timeGranularity}
            onChange={handleGranularityChange}
            size="small"
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: t.granDay, value: 'day' },
              { label: t.granWeek, value: 'week' },
              { label: t.granMonth, value: 'month' },
            ]}
          />
        </div>
      </div>

      {/* 第二层：订单类型、设备类型、套餐类型、套餐版本 */}
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.orderType}</span>
          <Select
            mode="multiple"
            value={filters.orderTypes}
            onChange={(v) => handleMultiSelectChange('orderTypes', v)}
            options={ORDER_TYPE_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.filterDeviceType}</span>
          <Select
            mode="multiple"
            value={filters.deviceTypes}
            onChange={(v) => handleMultiSelectChange('deviceTypes', v)}
            options={DEVICE_TYPE_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.filterPkgType}</span>
          <Select
            mode="multiple"
            value={filters.productTypes}
            onChange={(v) => handleMultiSelectChange('productTypes', v)}
            options={PRODUCT_TYPE_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.pkgVersion}</span>
          <Select
            mode="multiple"
            value={filters.packageVersions}
            onChange={(v) => handleMultiSelectChange('packageVersions', v)}
            options={PACKAGE_VERSION_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>Source App</span>
          <Select
            mode="multiple"
            value={filters.sourceApps}
            onChange={(v) => handleMultiSelectChange('sourceApps', v)}
            options={SOURCE_APP_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.factory}</span>
          <Select
            mode="multiple"
            value={filters.factories}
            onChange={(v) => handleMultiSelectChange('factories', v)}
            options={FACTORY_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>{t.seller}</span>
          <Select
            mode="multiple"
            value={filters.sellers}
            onChange={(v) => handleMultiSelectChange('sellers', v)}
            options={SELLER_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>TP</span>
          <Select
            mode="multiple"
            value={filters.tpList}
            onChange={(v) => handleMultiSelectChange('tpList', v)}
            options={TP_OPTIONS}
            placeholder={t.allPlaceholder}
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

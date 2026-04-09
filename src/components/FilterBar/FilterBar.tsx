import { DatePicker, Radio, Select } from 'antd';
import type { RadioChangeEvent } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useDashboardStore } from '../../store/useDashboardStore';
import type { DashboardFilters } from '../../types/dashboard';
import styles from './FilterBar.module.css';

const { RangePicker } = DatePicker;

const ORDER_TYPE_OPTIONS = [
  { label: '云存', value: 'cloud_storage' },
  { label: '云+4G', value: 'cloud_4g' },
  { label: '4G', value: '4g' },
  { label: 'AI', value: 'ai' },
  { label: '云+AI', value: 'cloud_ai' },
];

const DEVICE_TYPE_OPTIONS = [
  { label: '电池摄像机', value: 'battery_camera' },
  { label: '4G摄像机', value: '4g_camera' },
  { label: '常电摄像机', value: 'ac_camera' },
  { label: '门铃', value: 'doorbell' },
];

const PRODUCT_TYPE_OPTIONS = [
  { label: '年包', value: 'yearly' },
  { label: '月包', value: 'monthly' },
  { label: '季包', value: 'quarterly' },
  { label: '日包', value: 'daily' },
];

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
  const { filters, setFilters } = useDashboardStore();

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
          <span className={styles.filterLabel}>时间范围</span>
          <RangePicker
            value={[dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]}
            onChange={handleDateRangeChange}
            allowClear={false}
            size="small"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>时间粒度</span>
          <Radio.Group
            value={filters.timeGranularity}
            onChange={handleGranularityChange}
            size="small"
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: '日', value: 'day' },
              { label: '周', value: 'week' },
              { label: '月', value: 'month' },
            ]}
          />
        </div>
      </div>

      {/* 第二层：订单类型、设备类型、套餐类型、套餐版本 */}
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>订单类型</span>
          <Select
            mode="multiple"
            value={filters.orderTypes}
            onChange={(v) => handleMultiSelectChange('orderTypes', v)}
            options={ORDER_TYPE_OPTIONS}
            placeholder="全部"
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>设备类型</span>
          <Select
            mode="multiple"
            value={filters.deviceTypes}
            onChange={(v) => handleMultiSelectChange('deviceTypes', v)}
            options={DEVICE_TYPE_OPTIONS}
            placeholder="全部"
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>套餐类型</span>
          <Select
            mode="multiple"
            value={filters.productTypes}
            onChange={(v) => handleMultiSelectChange('productTypes', v)}
            options={PRODUCT_TYPE_OPTIONS}
            placeholder="全部"
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>套餐版本</span>
          <Select
            mode="multiple"
            value={filters.packageVersions}
            onChange={(v) => handleMultiSelectChange('packageVersions', v)}
            options={PACKAGE_VERSION_OPTIONS}
            placeholder="全部"
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
            placeholder="全部"
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>工厂</span>
          <Select
            mode="multiple"
            value={filters.factories}
            onChange={(v) => handleMultiSelectChange('factories', v)}
            options={FACTORY_OPTIONS}
            placeholder="全部"
            allowClear
            size="small"
            style={SELECT_STYLE}
            maxTagCount="responsive"
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>卖家</span>
          <Select
            mode="multiple"
            value={filters.sellers}
            onChange={(v) => handleMultiSelectChange('sellers', v)}
            options={SELLER_OPTIONS}
            placeholder="全部"
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
            placeholder="全部"
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

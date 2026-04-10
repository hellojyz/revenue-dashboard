import { useMemo, useCallback, useEffect, useRef } from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useHeatmapStore } from '../../store/useHeatmapStore';
import {
  sortWithTieBreaking,
  getColorLevel,
  formatMetricDisplay,
  DEFAULT_HEATMAP_THRESHOLDS,
  METRIC_LABELS,
  DEVICE_TYPE_LABELS,
  PACKAGE_TYPE_LABELS,
} from '../../utils/heatmapThresholds';
import type {
  HeatmapAppMetric,
  HeatmapMetricKey,
  HeatmapColorLevel,
  HeatmapSortConfig,
} from '../../types/heatmap';
import styles from './HeatmapDetailTable.module.css';

const RISK_CLASS: Record<HeatmapColorLevel, string> = {
  critical: styles.riskCritical,
  warning: styles.riskWarning,
  normal: styles.riskNormal,
  excellent: styles.riskExcellent,
};

interface Props {
  data: HeatmapAppMetric[];
}

function metricRender(metricKey: HeatmapMetricKey) {
  return (val: number | null, _record: HeatmapAppMetric) => {
    if (val === null || val === undefined) {
      return <span className={styles.nullValue}>--</span>;
    }
    const level = getColorLevel(val, metricKey, DEFAULT_HEATMAP_THRESHOLDS);
    return <span className={RISK_CLASS[level]}>{formatMetricDisplay(val, metricKey)}</span>;
  };
}

export default function HeatmapDetailTable({ data }: Props) {
  const highlight = useHeatmapStore((s) => s.highlight);
  const sortConfig = useHeatmapStore((s) => s.sortConfig);
  const setSortConfig = useHeatmapStore((s) => s.setSortConfig);
  const toggleHighlight = useHeatmapStore((s) => s.toggleHighlight);
  const tableRef = useRef<HTMLDivElement>(null);

  const sortedData = useMemo(
    () => sortWithTieBreaking(data, sortConfig),
    [data, sortConfig],
  );

  // Auto scroll to highlighted row
  useEffect(() => {
    if (!highlight || !tableRef.current) return;
    const row = tableRef.current.querySelector(`.${styles.highlightedRow}`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight]);

  const columns: ColumnsType<HeatmapAppMetric> = useMemo(
    () => [
      {
        title: 'APP名称',
        dataIndex: 'appName',
        key: 'appName',
        width: 180,
        fixed: 'left' as const,
        sorter: true,
        sortOrder:
          sortConfig.field === 'appName'
            ? sortConfig.order === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
      },
      {
        title: METRIC_LABELS.deviceCount,
        dataIndex: 'deviceCount',
        key: 'deviceCount',
        width: 120,
        sorter: true,
        sortOrder:
          sortConfig.field === 'deviceCount'
            ? sortConfig.order === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
        render: metricRender('deviceCount'),
      },
      {
        title: METRIC_LABELS.subscriptionConversionRate,
        dataIndex: 'subscriptionConversionRate',
        key: 'subscriptionConversionRate',
        width: 160,
        sorter: true,
        sortOrder:
          sortConfig.field === 'subscriptionConversionRate'
            ? sortConfig.order === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
        render: metricRender('subscriptionConversionRate'),
      },
      {
        title: METRIC_LABELS.subscriptionRetentionRate,
        dataIndex: 'subscriptionRetentionRate',
        key: 'subscriptionRetentionRate',
        width: 160,
        sorter: true,
        sortOrder:
          sortConfig.field === 'subscriptionRetentionRate'
            ? sortConfig.order === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
        render: metricRender('subscriptionRetentionRate'),
      },
      {
        title: METRIC_LABELS.revenuePerDevice,
        dataIndex: 'revenuePerDevice',
        key: 'revenuePerDevice',
        width: 130,
        sorter: true,
        sortOrder:
          sortConfig.field === 'revenuePerDevice'
            ? sortConfig.order === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
        render: metricRender('revenuePerDevice'),
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        key: 'deviceType',
        width: 120,
        render: (val: string) => DEVICE_TYPE_LABELS[val] ?? val,
      },
      {
        title: '套餐类型',
        dataIndex: 'packageType',
        key: 'packageType',
        width: 100,
        render: (val: string) => PACKAGE_TYPE_LABELS[val] ?? val,
      },
      {
        title: '指标风险标记',
        key: 'riskMark',
        width: 120,
        render: (_: unknown, record: HeatmapAppMetric) => {
          const metricKeys: HeatmapMetricKey[] = [
            'deviceCount',
            'subscriptionConversionRate',
            'subscriptionRetentionRate',
            'revenuePerDevice',
          ];
          let worstLevel: 'normal' | 'warning' | 'critical' = 'normal';
          for (const key of metricKeys) {
            const val = record[key];
            if (val === null || val === undefined) continue;
            const level = getColorLevel(val, key, DEFAULT_HEATMAP_THRESHOLDS);
            if (level === 'critical') { worstLevel = 'critical'; break; }
            if (level === 'warning') worstLevel = 'warning';
          }
          if (worstLevel === 'critical') return <span className={styles.riskCritical}>🔴严重</span>;
          if (worstLevel === 'warning') return <span className={styles.riskWarning}>🟠预警</span>;
          return <span className={styles.riskNormal}>🟢正常</span>;
        },
      },
    ],
    [sortConfig],
  );

  const handleTableChange = useCallback(
    (_pagination: TablePaginationConfig, _filters: any, sorter: any) => {
      if (sorter && sorter.field) {
        const field = sorter.field as HeatmapSortConfig['field'];
        const order = sorter.order === 'ascend' ? 'asc' : 'desc';
        setSortConfig({ field, order });
      }
    },
    [setSortConfig],
  );

  const exportToCSV = useCallback(
    (rows: HeatmapAppMetric[], filename: string) => {
      const header = ['APP名称', '设备数', '转化率', '留存率', '单设备收益', '设备类型', '套餐类型'];
      const csvRows = [header.join(',')];
      for (const row of rows) {
        csvRows.push(
          [
            row.appName,
            formatMetricDisplay(row.deviceCount, 'deviceCount'),
            formatMetricDisplay(row.subscriptionConversionRate, 'subscriptionConversionRate'),
            formatMetricDisplay(row.subscriptionRetentionRate, 'subscriptionRetentionRate'),
            formatMetricDisplay(row.revenuePerDevice, 'revenuePerDevice'),
            DEVICE_TYPE_LABELS[row.deviceType] ?? row.deviceType,
            PACKAGE_TYPE_LABELS[row.packageType] ?? row.packageType,
          ].join(','),
        );
      }
      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [],
  );

  const paginationRef = useRef({ current: 1, pageSize: 10 });

  const handleExportAll = useCallback(() => {
    exportToCSV(sortedData, '热力图看板_全量数据');
  }, [sortedData, exportToCSV]);

  const handleExportPage = useCallback(() => {
    const { current, pageSize } = paginationRef.current;
    const start = (current - 1) * pageSize;
    const pageData = sortedData.slice(start, start + pageSize);
    exportToCSV(pageData, '热力图看板_当前页');
  }, [sortedData, exportToCSV]);

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      defaultPageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
      showSizeChanger: true,
      showTotal: (total: number) => `共 ${total} 条`,
      onChange: (page: number, pageSize: number) => {
        paginationRef.current = { current: page, pageSize };
      },
      onShowSizeChange: (_current: number, size: number) => {
        paginationRef.current = { current: 1, pageSize: size };
      },
    }),
    [],
  );

  return (
    <div className={styles.container} ref={tableRef}>
      <div className={styles.header}>
        <span className={styles.title}>明细数据表格</span>
        <div className={styles.exportBtns}>
          <Button size="small" onClick={handleExportAll}>
            导出当前筛选结果
          </Button>
          <Button size="small" onClick={handleExportPage}>
            导出当前页
          </Button>
        </div>
      </div>
      <Table<HeatmapAppMetric>
        columns={columns}
        dataSource={sortedData}
        rowKey="appName"
        size="small"
        sticky
        scroll={{ x: 1100 }}
        pagination={pagination}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => toggleHighlight({ appName: record.appName }),
          className:
            highlight?.appName === record.appName ? styles.highlightedRow : undefined,
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
}

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useHeatmapStore } from '../../store/useHeatmapStore';
import { sortWithTieBreaking, getColorLevel, formatMetricDisplay, DEFAULT_HEATMAP_THRESHOLDS, DEVICE_TYPE_LABELS, PACKAGE_TYPE_LABELS } from '../../utils/heatmapThresholds';
import { useI18n } from '../../i18n/I18nContext';
import type { HeatmapAppMetric, HeatmapMetricKey, HeatmapColorLevel, HeatmapSortConfig } from '../../types/heatmap';
import styles from './HeatmapDetailTable.module.css';

const RISK_CLASS: Record<HeatmapColorLevel, string> = { critical: styles.riskCritical, warning: styles.riskWarning, normal: styles.riskNormal, excellent: styles.riskExcellent };

interface Props { data: HeatmapAppMetric[]; }

function metricRender(metricKey: HeatmapMetricKey) {
  return (val: number | null) => {
    if (val == null) return <span className={styles.nullValue}>--</span>;
    const level = getColorLevel(val, metricKey, DEFAULT_HEATMAP_THRESHOLDS);
    return <span className={RISK_CLASS[level]}>{formatMetricDisplay(val, metricKey)}</span>;
  };
}

export default function HeatmapDetailTable({ data }: Props) {
  const { t } = useI18n();
  const highlight = useHeatmapStore((s) => s.highlight);
  const sortConfig = useHeatmapStore((s) => s.sortConfig);
  const setSortConfig = useHeatmapStore((s) => s.setSortConfig);
  const toggleHighlight = useHeatmapStore((s) => s.toggleHighlight);
  const tableRef = useRef<HTMLDivElement>(null);
  const sortedData = useMemo(() => sortWithTieBreaking(data, sortConfig), [data, sortConfig]);

  useEffect(() => {
    if (!highlight || !tableRef.current) return;
    const row = tableRef.current.querySelector(`.${styles.highlightedRow}`);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight]);

  const so = (field: string) => sortConfig.field === field ? (sortConfig.order === 'asc' ? 'ascend' as const : 'descend' as const) : undefined;

  const columns: ColumnsType<HeatmapAppMetric> = useMemo(() => [
    { title: t.appName, dataIndex: 'appName', key: 'appName', width: 180, fixed: 'left' as const, sorter: true, sortOrder: so('appName') },
    { title: t.deviceCount, dataIndex: 'deviceCount', key: 'deviceCount', width: 120, sorter: true, sortOrder: so('deviceCount'), render: metricRender('deviceCount') },
    { title: t.conversionRate, dataIndex: 'subscriptionConversionRate', key: 'subscriptionConversionRate', width: 160, sorter: true, sortOrder: so('subscriptionConversionRate'), render: metricRender('subscriptionConversionRate') },
    { title: t.retentionRate, dataIndex: 'subscriptionRetentionRate', key: 'subscriptionRetentionRate', width: 160, sorter: true, sortOrder: so('subscriptionRetentionRate'), render: metricRender('subscriptionRetentionRate') },
    { title: t.revenuePerDevice, dataIndex: 'revenuePerDevice', key: 'revenuePerDevice', width: 130, sorter: true, sortOrder: so('revenuePerDevice'), render: metricRender('revenuePerDevice') },
    { title: t.deviceType, dataIndex: 'deviceType', key: 'deviceType', width: 120, render: (v: string) => (t as any)[v] ?? DEVICE_TYPE_LABELS[v] ?? v },
    { title: t.packageType, dataIndex: 'packageType', key: 'packageType', width: 100, render: (v: string) => (t as any)[v] ?? PACKAGE_TYPE_LABELS[v] ?? v },
    { title: t.riskMark, key: 'riskMark', width: 120, render: (_: unknown, rec: HeatmapAppMetric) => {
      const keys: HeatmapMetricKey[] = ['deviceCount', 'subscriptionConversionRate', 'subscriptionRetentionRate', 'revenuePerDevice'];
      let worst: 'normal' | 'warning' | 'critical' = 'normal';
      for (const k of keys) { const v = rec[k]; if (v == null) continue; const lv = getColorLevel(v, k, DEFAULT_HEATMAP_THRESHOLDS); if (lv === 'critical') { worst = 'critical'; break; } if (lv === 'warning') worst = 'warning'; }
      if (worst === 'critical') return <span className={styles.riskCritical}>🔴{t.severe}</span>;
      if (worst === 'warning') return <span className={styles.riskWarning}>🟠{t.warning}</span>;
      return <span className={styles.riskNormal}>🟢{t.normal}</span>;
    }},
  ], [sortConfig, t]);

  const handleTableChange = useCallback((_p: TablePaginationConfig, _f: any, sorter: any) => {
    if (sorter?.field) setSortConfig({ field: sorter.field as HeatmapSortConfig['field'], order: sorter.order === 'ascend' ? 'asc' : 'desc' });
  }, [setSortConfig]);

  const exportToCSV = useCallback((rows: HeatmapAppMetric[], filename: string) => {
    const header = [t.appName, t.deviceCount, t.conversionRate, t.retentionRate, t.revenuePerDevice, t.deviceType, t.packageType];
    const csvRows = [header.join(',')];
    for (const row of rows) {
      csvRows.push([row.appName, formatMetricDisplay(row.deviceCount, 'deviceCount'), formatMetricDisplay(row.subscriptionConversionRate, 'subscriptionConversionRate'),
        formatMetricDisplay(row.subscriptionRetentionRate, 'subscriptionRetentionRate'), formatMetricDisplay(row.revenuePerDevice, 'revenuePerDevice'),
        (t as any)[row.deviceType] ?? DEVICE_TYPE_LABELS[row.deviceType] ?? row.deviceType, (t as any)[row.packageType] ?? PACKAGE_TYPE_LABELS[row.packageType] ?? row.packageType].join(','));
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click(); URL.revokeObjectURL(url);
  }, [t]);

  const paginationRef = useRef({ current: 1, pageSize: 10 });
  const handleExportAll = useCallback(() => exportToCSV(sortedData, 'heatmap_all'), [sortedData, exportToCSV]);
  const handleExportPage = useCallback(() => {
    const { current, pageSize } = paginationRef.current;
    exportToCSV(sortedData.slice((current - 1) * pageSize, current * pageSize), 'heatmap_page');
  }, [sortedData, exportToCSV]);

  const pagination: TablePaginationConfig = useMemo(() => ({
    defaultPageSize: 10, pageSizeOptions: ['10', '20', '50'], showSizeChanger: true,
    showTotal: (total: number) => `${t.total} ${total} ${t.items}`,
    onChange: (page: number, pageSize: number) => { paginationRef.current = { current: page, pageSize }; },
    onShowSizeChange: (_c: number, size: number) => { paginationRef.current = { current: 1, pageSize: size }; },
  }), [t]);

  return (
    <div className={styles.container} ref={tableRef}>
      <div className={styles.header}>
        <span className={styles.title}>{t.detailTable}</span>
        <div className={styles.exportBtns}>
          <Button size="small" onClick={handleExportAll}>{t.exportAll}</Button>
          <Button size="small" onClick={handleExportPage}>{t.exportPage}</Button>
        </div>
      </div>
      <Table<HeatmapAppMetric> columns={columns} dataSource={sortedData} rowKey="appName" size="small" sticky scroll={{ x: 1100 }}
        pagination={pagination} onChange={handleTableChange}
        onRow={(rec) => ({ onClick: () => toggleHighlight({ appName: rec.appName }), className: highlight?.appName === rec.appName ? styles.highlightedRow : undefined, style: { cursor: 'pointer' } })} />
    </div>
  );
}

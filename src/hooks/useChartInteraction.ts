import { useCallback } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

/**
 * useChartInteraction 联动交互 Hook
 * 封装主趋势图时间点点击联动、套餐排行图产品点击联动、清除联动状态
 */
export function useChartInteraction() {
  const drillDownDate = useDashboardStore((s) => s.drillDownDate);
  const drillDownProduct = useDashboardStore((s) => s.drillDownProduct);
  const setDrillDownDate = useDashboardStore((s) => s.setDrillDownDate);
  const setDrillDownProduct = useDashboardStore((s) => s.setDrillDownProduct);
  const clearDrillDown = useDashboardStore((s) => s.clearDrillDown);

  /**
   * 主趋势图时间点点击联动
   * 再次点击同一时间点清除（toggle）
   */
  const handleDateClick = useCallback(
    (date: string) => {
      setDrillDownDate(drillDownDate === date ? null : date);
    },
    [drillDownDate, setDrillDownDate],
  );

  /**
   * 套餐排行图产品点击联动
   * 再次点击同一产品清除（toggle）
   */
  const handleProductClick = useCallback(
    (product: string) => {
      setDrillDownProduct(drillDownProduct === product ? null : product);
    },
    [drillDownProduct, setDrillDownProduct],
  );

  return {
    drillDownDate,
    drillDownProduct,
    handleDateClick,
    handleProductClick,
    clearDrillDown,
  };
}

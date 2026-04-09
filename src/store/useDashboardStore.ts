import { create } from 'zustand';
import type { DashboardFilters } from '../types/dashboard';

export interface DashboardStore {
  filters: DashboardFilters;
  setFilters: (partial: Partial<DashboardFilters>) => void;
  resetFilters: () => void;

  // 图表联动状态
  drillDownDate: string | null;
  drillDownProduct: string | null;
  setDrillDownDate: (date: string | null) => void;
  setDrillDownProduct: (product: string | null) => void;
  clearDrillDown: () => void;
}

function getDefaultDateRange(): [string, string] {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1); // 前1个自然月
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}

export const defaultFilters: DashboardFilters = {
  dateRange: getDefaultDateRange(),
  timeGranularity: 'day',
  orderTypes: [],
  deviceTypes: [],
  productTypes: [],
  packageVersions: [],
  sourceApps: [],
  factories: [],
  sellers: [],
  tpList: [],
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  filters: { ...defaultFilters, dateRange: [...defaultFilters.dateRange] },

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  resetFilters: () =>
    set(() => ({
      filters: { ...defaultFilters, dateRange: getDefaultDateRange() },
    })),

  drillDownDate: null,
  drillDownProduct: null,

  setDrillDownDate: (date) => set({ drillDownDate: date }),
  setDrillDownProduct: (product) => set({ drillDownProduct: product }),
  clearDrillDown: () => set({ drillDownDate: null, drillDownProduct: null }),
}));

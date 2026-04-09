import { create } from 'zustand';
import type {
  HeatmapFilters,
  HeatmapHighlight,
  HeatmapSortConfig,
} from '../types/heatmap';

export interface HeatmapStore {
  // 筛选条件（已提交的）
  filters: HeatmapFilters;
  // 暂存的筛选条件（未提交）
  pendingFilters: HeatmapFilters;

  // 联动高亮
  highlight: HeatmapHighlight | null;

  // 排序配置
  sortConfig: HeatmapSortConfig;

  // Actions
  setPendingFilters: (partial: Partial<HeatmapFilters>) => void;
  commitFilters: () => void;
  resetFilters: () => void;
  setHighlight: (h: HeatmapHighlight | null) => void;
  toggleHighlight: (h: HeatmapHighlight) => void;
  setSortConfig: (config: HeatmapSortConfig) => void;
}

export const defaultHeatmapFilters: HeatmapFilters = {
  deviceType: 'all',
  packageType: 'all',
  timePeriod: 'last_30_days',
};

export const defaultSortConfig: HeatmapSortConfig = {
  field: 'deviceCount',
  order: 'desc',
};

export const useHeatmapStore = create<HeatmapStore>((set) => ({
  filters: { ...defaultHeatmapFilters },
  pendingFilters: { ...defaultHeatmapFilters },
  highlight: null,
  sortConfig: { ...defaultSortConfig },

  setPendingFilters: (partial) =>
    set((state) => ({
      pendingFilters: { ...state.pendingFilters, ...partial },
    })),

  commitFilters: () =>
    set((state) => ({
      filters: { ...state.pendingFilters },
    })),

  resetFilters: () =>
    set(() => ({
      filters: { ...defaultHeatmapFilters },
      pendingFilters: { ...defaultHeatmapFilters },
      highlight: null,
    })),

  setHighlight: (h) => set({ highlight: h }),

  toggleHighlight: (h) =>
    set((state) => {
      if (
        state.highlight &&
        state.highlight.appName === h.appName &&
        state.highlight.metricKey === h.metricKey
      ) {
        return { highlight: null };
      }
      return { highlight: h };
    }),

  setSortConfig: (config) => set({ sortConfig: config }),
}));

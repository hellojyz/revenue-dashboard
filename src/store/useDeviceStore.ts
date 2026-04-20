import { create } from 'zustand';
import type { DeviceFilters, DistributionDimension } from '../types/deviceDashboard';

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

interface DeviceStore {
  filters: DeviceFilters;
  pendingFilters: DeviceFilters;
  highlightedChart: string | null;
  drillDownPoint: string | null;
  distributionDimension: DistributionDimension;

  setPendingFilters: (partial: Partial<DeviceFilters>) => void;
  commitFilters: () => void;
  resetFilters: () => void;
  setHighlightedChart: (chartId: string | null) => void;
  setDrillDownPoint: (point: string | null) => void;
  setDistributionDimension: (dim: DistributionDimension) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  filters: DEFAULT_FILTERS,
  pendingFilters: DEFAULT_FILTERS,
  highlightedChart: null,
  drillDownPoint: null,
  distributionDimension: 'model',

  setPendingFilters: (partial) =>
    set((s) => ({ pendingFilters: { ...s.pendingFilters, ...partial } })),
  commitFilters: () =>
    set((s) => ({
      filters: { ...s.pendingFilters },
      drillDownPoint: null,
      highlightedChart: null,
    })),
  resetFilters: () =>
    set({ filters: DEFAULT_FILTERS, pendingFilters: DEFAULT_FILTERS }),
  setHighlightedChart: (chartId) =>
    set((s) => ({ highlightedChart: s.highlightedChart === chartId ? null : chartId })),
  setDrillDownPoint: (point) =>
    set((s) => ({ drillDownPoint: s.drillDownPoint === point ? null : point })),
  setDistributionDimension: (dim) =>
    set({ distributionDimension: dim }),
}));

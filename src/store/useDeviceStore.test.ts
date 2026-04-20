import { describe, it, expect, beforeEach } from 'vitest';
import { useDeviceStore } from './useDeviceStore';
import type { TimeRange, PowerType, LifecycleStage, DeviceRegion, DeviceChannel } from '../types/deviceDashboard';

const DEFAULT_STATE = {
  filters: {
    timeRange: 'last_12_months' as TimeRange,
    region: [] as DeviceRegion[],
    channel: [] as DeviceChannel[],
    model: [] as string[],
    firmwareVersion: [] as string[],
    appVersion: [] as string[],
    powerType: [] as PowerType[],
    lifecycleStage: [] as LifecycleStage[],
  },
  pendingFilters: {
    timeRange: 'last_12_months' as TimeRange,
    region: [] as DeviceRegion[],
    channel: [] as DeviceChannel[],
    model: [] as string[],
    firmwareVersion: [] as string[],
    appVersion: [] as string[],
    powerType: [] as PowerType[],
    lifecycleStage: [] as LifecycleStage[],
  },
  highlightedChart: null,
  drillDownPoint: null,
  distributionDimension: 'model' as const,
};

describe('useDeviceStore', () => {
  beforeEach(() => {
    useDeviceStore.setState({ ...DEFAULT_STATE });
  });

  describe('commitFilters', () => {
    it('filters should equal pendingFilters after commitFilters()', () => {
      const { setPendingFilters, commitFilters } = useDeviceStore.getState();
      setPendingFilters({ timeRange: 'last_6_months', region: ['中国', '北美'] });
      commitFilters();
      const { filters, pendingFilters } = useDeviceStore.getState();
      expect(filters).toEqual(pendingFilters);
      expect(filters.timeRange).toBe('last_6_months');
      expect(filters.region).toEqual(['中国', '北美']);
    });

    it('commitFilters() clears drillDownPoint', () => {
      useDeviceStore.setState({ drillDownPoint: '2025-01' });
      useDeviceStore.getState().commitFilters();
      expect(useDeviceStore.getState().drillDownPoint).toBeNull();
    });

    it('commitFilters() clears highlightedChart', () => {
      useDeviceStore.setState({ highlightedChart: 'scale' });
      useDeviceStore.getState().commitFilters();
      expect(useDeviceStore.getState().highlightedChart).toBeNull();
    });

    it('commitFilters() clears both drillDownPoint and highlightedChart simultaneously', () => {
      useDeviceStore.setState({ drillDownPoint: '2025-03', highlightedChart: 'online' });
      useDeviceStore.getState().commitFilters();
      const state = useDeviceStore.getState();
      expect(state.drillDownPoint).toBeNull();
      expect(state.highlightedChart).toBeNull();
    });
  });

  describe('setHighlightedChart (toggle)', () => {
    it('sets highlightedChart to given value', () => {
      useDeviceStore.getState().setHighlightedChart('scale');
      expect(useDeviceStore.getState().highlightedChart).toBe('scale');
    });

    it('toggles highlightedChart to null when called with same value', () => {
      useDeviceStore.getState().setHighlightedChart('scale');
      useDeviceStore.getState().setHighlightedChart('scale');
      expect(useDeviceStore.getState().highlightedChart).toBeNull();
    });

    it('switches to new chartId when called with different value', () => {
      useDeviceStore.getState().setHighlightedChart('scale');
      useDeviceStore.getState().setHighlightedChart('online');
      expect(useDeviceStore.getState().highlightedChart).toBe('online');
    });
  });

  describe('setDrillDownPoint (toggle)', () => {
    it('sets drillDownPoint to given value', () => {
      useDeviceStore.getState().setDrillDownPoint('2025-01');
      expect(useDeviceStore.getState().drillDownPoint).toBe('2025-01');
    });

    it('toggles drillDownPoint to null when called with same value', () => {
      useDeviceStore.getState().setDrillDownPoint('2025-01');
      useDeviceStore.getState().setDrillDownPoint('2025-01');
      expect(useDeviceStore.getState().drillDownPoint).toBeNull();
    });

    it('switches to new point when called with different value', () => {
      useDeviceStore.getState().setDrillDownPoint('2025-01');
      useDeviceStore.getState().setDrillDownPoint('2025-02');
      expect(useDeviceStore.getState().drillDownPoint).toBe('2025-02');
    });
  });
});

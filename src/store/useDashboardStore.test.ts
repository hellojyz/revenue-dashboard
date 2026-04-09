import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore, defaultFilters } from './useDashboardStore';

describe('useDashboardStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useDashboardStore.setState({
      filters: { ...defaultFilters, dateRange: [...defaultFilters.dateRange] },
      drillDownDate: null,
      drillDownProduct: null,
    });
  });

  describe('default state', () => {
    it('should have timeGranularity default to "day"', () => {
      const { filters } = useDashboardStore.getState();
      expect(filters.timeGranularity).toBe('day');
    });

    it('should have all multi-select arrays default to empty (meaning all)', () => {
      const { filters } = useDashboardStore.getState();
      expect(filters.orderTypes).toEqual([]);
      expect(filters.deviceTypes).toEqual([]);
      expect(filters.productTypes).toEqual([]);
      expect(filters.packageVersions).toEqual([]);
      expect(filters.sourceApps).toEqual([]);
      expect(filters.factories).toEqual([]);
      expect(filters.sellers).toEqual([]);
      expect(filters.tpList).toEqual([]);
    });

    it('should have dateRange default to 90 days before and after today', () => {
      const { filters } = useDashboardStore.getState();
      const [start, end] = filters.dateRange;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(180); // 90 days before + 90 days after
    });

    it('should have drillDown states as null', () => {
      const state = useDashboardStore.getState();
      expect(state.drillDownDate).toBeNull();
      expect(state.drillDownProduct).toBeNull();
    });
  });

  describe('setFilters', () => {
    it('should partially update filters', () => {
      useDashboardStore.getState().setFilters({ timeGranularity: 'week' });
      const { filters } = useDashboardStore.getState();
      expect(filters.timeGranularity).toBe('week');
      // Other fields remain unchanged
      expect(filters.orderTypes).toEqual([]);
    });

    it('should update multiple fields at once', () => {
      useDashboardStore.getState().setFilters({
        timeGranularity: 'month',
        orderTypes: ['type1', 'type2'],
      });
      const { filters } = useDashboardStore.getState();
      expect(filters.timeGranularity).toBe('month');
      expect(filters.orderTypes).toEqual(['type1', 'type2']);
    });
  });

  describe('resetFilters', () => {
    it('should reset filters to defaults', () => {
      useDashboardStore.getState().setFilters({
        timeGranularity: 'month',
        orderTypes: ['a'],
        deviceTypes: ['b'],
      });
      useDashboardStore.getState().resetFilters();
      const { filters } = useDashboardStore.getState();
      expect(filters.timeGranularity).toBe('day');
      expect(filters.orderTypes).toEqual([]);
      expect(filters.deviceTypes).toEqual([]);
    });
  });

  describe('drill-down state', () => {
    it('setDrillDownDate should update drillDownDate', () => {
      useDashboardStore.getState().setDrillDownDate('2024-01-15');
      expect(useDashboardStore.getState().drillDownDate).toBe('2024-01-15');
    });

    it('setDrillDownProduct should update drillDownProduct', () => {
      useDashboardStore.getState().setDrillDownProduct('云存');
      expect(useDashboardStore.getState().drillDownProduct).toBe('云存');
    });

    it('setDrillDownDate(null) should clear drillDownDate', () => {
      useDashboardStore.getState().setDrillDownDate('2024-01-15');
      useDashboardStore.getState().setDrillDownDate(null);
      expect(useDashboardStore.getState().drillDownDate).toBeNull();
    });

    it('clearDrillDown should clear both drill-down states', () => {
      useDashboardStore.getState().setDrillDownDate('2024-01-15');
      useDashboardStore.getState().setDrillDownProduct('云存');
      useDashboardStore.getState().clearDrillDown();
      expect(useDashboardStore.getState().drillDownDate).toBeNull();
      expect(useDashboardStore.getState().drillDownProduct).toBeNull();
    });
  });
});

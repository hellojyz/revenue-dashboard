import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useDeviceKPIData hook
vi.mock('../../../hooks/useDeviceData', () => ({
  useDeviceKPIData: vi.fn(),
  useDeviceTrendData: vi.fn(() => ({ data: null, isLoading: false, isError: false })),
  useDeviceDistributionData: vi.fn(() => ({ data: null, isLoading: false, isError: false })),
}));

// Mock child components
vi.mock('../DeviceFilterBar', () => ({
  default: () => <div data-testid="device-filter-bar" />,
}));
vi.mock('../DeviceKPIRow', () => ({
  default: () => <div data-testid="device-kpi-row" />,
}));
vi.mock('../DeviceTrendGrid', () => ({
  default: () => <div data-testid="device-trend-grid" />,
}));
vi.mock('../DeviceDistributionChart', () => ({
  default: () => <div data-testid="device-distribution-chart" />,
}));
vi.mock('../DeviceTopicEntries', () => ({
  default: () => <div data-testid="device-topic-entries" />,
}));

import { useDeviceKPIData } from '../../../hooks/useDeviceData';
import DeviceDashboardPage from '../DeviceDashboardPage';

const mockUseDeviceKPIData = useDeviceKPIData as ReturnType<typeof vi.fn>;

const mockData = {
  totalDevices: 1200000,
  activatedDevices: 980000,
  activeDevices: 750000,
  onlineRate: 0.92,
  churnRatio: 0.08,
  updatedAt: '2025-04-01T10:00:00Z',
};

describe('DeviceDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normal render', () => {
    beforeEach(() => {
      mockUseDeviceKPIData.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });
    });

    it('renders page title "一级驾驶舱（设备域）"', () => {
      render(<DeviceDashboardPage />);
      expect(screen.getByText('一级驾驶舱（设备域）')).toBeInTheDocument();
    });

    it('renders subtitle containing "结果监控"', () => {
      render(<DeviceDashboardPage />);
      expect(screen.getByText(/结果监控/)).toBeInTheDocument();
    });

    it('renders DeviceFilterBar', () => {
      render(<DeviceDashboardPage />);
      expect(screen.getByTestId('device-filter-bar')).toBeInTheDocument();
    });

    it('renders DeviceKPIRow', () => {
      render(<DeviceDashboardPage />);
      expect(screen.getByTestId('device-kpi-row')).toBeInTheDocument();
    });

    it('renders DeviceTrendGrid', () => {
      render(<DeviceDashboardPage />);
      expect(screen.getByTestId('device-trend-grid')).toBeInTheDocument();
    });

    it('renders DeviceDistributionChart', () => {
      render(<DeviceDashboardPage />);
      expect(screen.getByTestId('device-distribution-chart')).toBeInTheDocument();
    });

    it('renders DeviceTopicEntries', () => {
      render(<DeviceDashboardPage />);
      expect(screen.getByTestId('device-topic-entries')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders LoadingState when isLoading is true', () => {
      mockUseDeviceKPIData.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });
      render(<DeviceDashboardPage />);
      // Title should not be visible during loading
      expect(screen.queryByText('一级驾驶舱（设备域）')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when isError is true', () => {
      mockUseDeviceKPIData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });
      render(<DeviceDashboardPage />);
      expect(screen.getByText(/数据加载失败/)).toBeInTheDocument();
    });

    it('renders retry button when isError is true', () => {
      mockUseDeviceKPIData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });
      render(<DeviceDashboardPage />);
      expect(screen.getByText('重试')).toBeInTheDocument();
    });
  });
});

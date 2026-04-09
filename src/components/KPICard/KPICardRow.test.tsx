import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import KPICardRow from './KPICardRow';
import type { KPIResponse } from '../../types/dashboard';

// Mock echarts-for-react
vi.mock('echarts-for-react', () => ({
  default: () => <div data-testid="mock-echarts" />,
}));

// Mock useKPIData hook
const mockUseKPIData = vi.fn();
vi.mock('../../hooks/useDashboardData', () => ({
  useKPIData: () => mockUseKPIData(),
}));

const mockKPIData: KPIResponse = {
  confirmedRevenue: { value: 123456.78, changePercent: 0.052, sparkline: [100, 120, 110] },
  meariSales: { value: 1250000, changePercent: 0.065, sparkline: [1200000, 1250000, 1230000] },
  costPrediction: { value: 80000, changePercent: -0.031, sparkline: [80, 85, 82] },
  profitPrediction: { value: 43456.78, changePercent: 0.12, sparkline: [40, 35, 43] },
  profitMargin: { value: 0.352, changePercent: 0.05, sparkline: [0.3, 0.33, 0.35] },
  topProfitPackage: { productType: '云存+AI', value: 15000, changePercent: 0.08 },
  topMarginPackage: { productType: '4G', value: 0.45, changePercent: 0.02 },
};

describe('KPICardRow', () => {
  it('renders loading state', () => {
    mockUseKPIData.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<KPICardRow />);
    expect(screen.getByText('指标数据加载中...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseKPIData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<KPICardRow />);
    expect(screen.getByText('指标数据加载失败')).toBeInTheDocument();
  });

  it('renders 5 KPI cards when data is available', () => {
    mockUseKPIData.mockReturnValue({ data: mockKPIData, isLoading: false, isError: false });
    render(<KPICardRow />);
    const cards = screen.getAllByTestId('kpi-card');
    expect(cards).toHaveLength(5);
  });

  it('renders correct titles for all cards', () => {
    mockUseKPIData.mockReturnValue({ data: mockKPIData, isLoading: false, isError: false });
    render(<KPICardRow />);
    expect(screen.getByText('每日可确认收入预测')).toBeInTheDocument();
    expect(screen.getByText('觅睿销售额预测')).toBeInTheDocument();
    expect(screen.getByText('每日成本预测')).toBeInTheDocument();
    expect(screen.getByText('每日利润预测')).toBeInTheDocument();
    expect(screen.getByText('利润率预测')).toBeInTheDocument();
  });

  it('sets highlighted on revenue, profit, and margin cards but not cost and sales', () => {
    mockUseKPIData.mockReturnValue({ data: mockKPIData, isLoading: false, isError: false });
    render(<KPICardRow />);
    const cards = screen.getAllByTestId('kpi-card');
    // Cards 0 (revenue) highlighted, 1 (sales) not, 2 (cost) not, 3 (profit) highlighted, 4 (margin) highlighted
    expect(cards[0].className).toContain('cardHighlighted');
    expect(cards[1].className).not.toContain('cardHighlighted');
    expect(cards[2].className).not.toContain('cardHighlighted');
    expect(cards[3].className).toContain('cardHighlighted');
    expect(cards[4].className).toContain('cardHighlighted');
  });

  it('shows "--" values when data is undefined', () => {
    mockUseKPIData.mockReturnValue({ data: undefined, isLoading: false, isError: false });
    render(<KPICardRow />);
    const values = screen.getAllByTestId('kpi-value');
    values.forEach((v) => {
      expect(v).toHaveTextContent('--');
    });
  });
});

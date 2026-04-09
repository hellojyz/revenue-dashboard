import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import KPICard from './KPICard';

// Mock echarts-for-react to avoid canvas/SVG rendering issues in jsdom
vi.mock('echarts-for-react', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mock-echarts" data-option={JSON.stringify(props.option)} />
  ),
}));

describe('KPICard', () => {
  const baseProps = {
    title: '每日可确认收入预测',
    value: '¥1,234.56',
    changePercent: 0.052,
    sparklineData: [100, 120, 110, 130, 125, 140, 135],
  };

  it('renders title and value', () => {
    render(<KPICard {...baseProps} />);
    expect(screen.getByText('每日可确认收入预测')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('¥1,234.56');
  });

  it('renders unit when provided', () => {
    render(<KPICard {...baseProps} unit="元" />);
    expect(screen.getByText('元')).toBeInTheDocument();
  });

  it('shows green up arrow for positive changePercent', () => {
    render(<KPICard {...baseProps} changePercent={0.052} />);
    const changeEl = screen.getByTestId('kpi-change');
    expect(changeEl).toHaveAttribute('data-direction', 'up');
    expect(changeEl).toHaveTextContent('↑');
    expect(changeEl).toHaveTextContent('+5.2%');
  });

  it('shows red down arrow for negative changePercent', () => {
    render(<KPICard {...baseProps} changePercent={-0.031} />);
    const changeEl = screen.getByTestId('kpi-change');
    expect(changeEl).toHaveAttribute('data-direction', 'down');
    expect(changeEl).toHaveTextContent('↓');
    expect(changeEl).toHaveTextContent('-3.1%');
  });

  it('shows neutral state for zero changePercent', () => {
    render(<KPICard {...baseProps} changePercent={0} />);
    const changeEl = screen.getByTestId('kpi-change');
    expect(changeEl).toHaveAttribute('data-direction', 'neutral');
    expect(changeEl).not.toHaveTextContent('↑');
    expect(changeEl).not.toHaveTextContent('↓');
  });

  it('displays "--" when value is empty string', () => {
    render(<KPICard {...baseProps} value="" />);
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('--');
  });

  it('displays "--" for NaN changePercent', () => {
    render(<KPICard {...baseProps} changePercent={NaN} />);
    const changeEl = screen.getByTestId('kpi-change');
    expect(changeEl).toHaveTextContent('--');
    expect(changeEl).toHaveAttribute('data-direction', 'neutral');
  });

  it('renders sparkline chart when data is provided', () => {
    render(<KPICard {...baseProps} />);
    expect(screen.getByTestId('kpi-sparkline')).toBeInTheDocument();
  });

  it('does not render sparkline when data is empty', () => {
    render(<KPICard {...baseProps} sparklineData={[]} />);
    expect(screen.queryByTestId('kpi-sparkline')).not.toBeInTheDocument();
  });

  it('applies highlighted styles when highlighted=true', () => {
    render(<KPICard {...baseProps} highlighted />);
    const card = screen.getByTestId('kpi-card');
    // The card should have the highlighted class (CSS modules may mangle names)
    expect(card.className).toContain('cardHighlighted');
  });

  it('does not apply highlighted styles by default', () => {
    render(<KPICard {...baseProps} />);
    const card = screen.getByTestId('kpi-card');
    expect(card.className).not.toContain('cardHighlighted');
  });
});

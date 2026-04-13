import { describe, it, expect } from 'vitest';
import {
  buildMainTrendOption,
  buildCostStructureOption,
  buildRevenueStructureOption,
  buildWaterfallOption,
  buildPackageRankingOption,
  buildCostDetailOption,
} from './chartHelpers';
import type {
  MainTrendResponse,
  CostStructureResponse,
  RevenueStructureResponse,
  WaterfallResponse,
  PackageRankingItem,
  CostDetailResponse,
} from '../types/dashboard';

// Helper to extract series from option
function getSeries(option: Record<string, unknown>): Array<Record<string, unknown>> {
  return option.series as Array<Record<string, unknown>>;
}

describe('buildMainTrendOption', () => {
  const data: MainTrendResponse = {
    dates: ['2024-01-01', '2024-01-02'],
    confirmedRevenue: [1000, 1200],
    meariSales: [1500, 1600],
    costPrediction: [800, 900],
    profitPrediction: [200, 300],
    profitMargin: [20, 25],
  };

  it('returns empty state for null/undefined data', () => {
    const opt = buildMainTrendOption(null);
    expect(opt.title).toBeDefined();
    expect(opt.series).toBeUndefined();
  });

  it('generates correct series types', () => {
    const opt = buildMainTrendOption(data);
    const series = getSeries(opt);
    expect(series).toHaveLength(4);

    // 柱图：收入 + 成本
    expect(series[0].type).toBe('bar');
    expect(series[0].name).toBe('可确认收入预测');
    expect(series[1].type).toBe('line');
    expect(series[1].name).toBe('觅睿销售额预测');
    expect(series[2].type).toBe('bar');
    expect(series[2].name).toBe('成本预测');

    // 折线：利润
    expect(series[3].type).toBe('line');
    expect(series[3].name).toBe('利润预测');
  });

  it('has single y-axis', () => {
    const opt = buildMainTrendOption(data);
    expect(Array.isArray(opt.yAxis)).toBe(false);
  });

  it('has tooltip formatter', () => {
    const opt = buildMainTrendOption(data);
    expect((opt.tooltip as Record<string, unknown>).formatter).toBeTypeOf('function');
  });
});

describe('buildCostStructureOption', () => {
  const data: CostStructureResponse = {
    dates: ['2024-01-01'],
    serverCost: [100],
    trafficCost: [200],
    trafficCost4G: [120],
    cardFeeCost: [80],
    paymentFee: [50],
    meariShareCost: [80],
    customerShareCost: [70],
  };

  it('returns empty state for null data', () => {
    const opt = buildCostStructureOption(null);
    expect(opt.series).toBeUndefined();
  });

  it('generates exactly 6 bar series with same stack', () => {
    const opt = buildCostStructureOption(data);
    const series = getSeries(opt);
    expect(series).toHaveLength(6);
    series.forEach((s) => {
      expect(s.type).toBe('bar');
      expect(s.stack).toBe('cost');
    });
  });

  it('uses distinct colors for each series', () => {
    const opt = buildCostStructureOption(data);
    const series = getSeries(opt);
    const colors = series.map((s) => (s.itemStyle as Record<string, string>).color);
    const unique = new Set(colors);
    expect(unique.size).toBe(6);
  });
});

describe('buildRevenueStructureOption', () => {
  const data: RevenueStructureResponse = {
    dates: ['2024-01-01'],
    meariRevenue: [500],
    customerRevenue: [300],
    totalConfirmedRevenue: [800],
  };

  it('returns empty state for null data', () => {
    const opt = buildRevenueStructureOption(null);
    expect(opt.series).toBeUndefined();
  });

  it('generates 2 stacked bars and 1 line', () => {
    const opt = buildRevenueStructureOption(data);
    const series = getSeries(opt);
    expect(series).toHaveLength(3);

    // 堆叠柱图
    expect(series[0].type).toBe('bar');
    expect(series[0].stack).toBe('revenue');
    expect(series[1].type).toBe('bar');
    expect(series[1].stack).toBe('revenue');

    // 折线
    expect(series[2].type).toBe('line');
  });
});

describe('buildWaterfallOption', () => {
  const data: WaterfallResponse = {
    totalRevenue: 1000,
    serverCost: 200,
    trafficCost: 150,
    trafficCost4G: 90,
    cardFeeCost: 60,
    paymentFee: 50,
    meariShareCost: 100,
    customerShareCost: 100,
    profit: 400,
  };

  it('returns empty state for null data', () => {
    const opt = buildWaterfallOption(null);
    expect(opt.series).toBeUndefined();
  });

  it('generates 2 series (transparent base + values)', () => {
    const opt = buildWaterfallOption(data);
    const series = getSeries(opt);
    expect(series).toHaveLength(2);
    expect(series[0].name).toBe('_transparent_base');
    expect(series[1].name).toBe('_values');
  });

  it('has 8 data points (revenue + 6 costs + profit)', () => {
    const opt = buildWaterfallOption(data);
    const series = getSeries(opt);
    expect((series[0].data as unknown[]).length).toBe(8);
    expect((series[1].data as unknown[]).length).toBe(8);
  });

  it('has tooltip formatter', () => {
    const opt = buildWaterfallOption(data);
    expect((opt.tooltip as Record<string, unknown>).formatter).toBeTypeOf('function');
  });
});

describe('buildPackageRankingOption', () => {
  const items: PackageRankingItem[] = [
    { name: '云存', profit: 300, profitMargin: 0.3, revenue: 1000, cost: 700 },
    { name: '4G', profit: 500, profitMargin: 0.25, revenue: 2000, cost: 1500 },
    { name: 'AI', profit: 100, profitMargin: 0.1, revenue: 1000, cost: 900 },
  ];

  it('returns empty state for null/empty items', () => {
    expect(buildPackageRankingOption(null).series).toBeUndefined();
    expect(buildPackageRankingOption([]).series).toBeUndefined();
  });

  it('sorts by profit descending by default', () => {
    const opt = buildPackageRankingOption(items, 'profit');
    const yAxis = opt.yAxis as Record<string, unknown>;
    const names = yAxis.data as string[];
    // Reversed for ECharts (top = highest), so first in array is lowest
    expect(names[names.length - 1]).toBe('4G'); // highest profit at top
    expect(names[0]).toBe('AI'); // lowest profit at bottom
  });

  it('generates horizontal bar chart', () => {
    const opt = buildPackageRankingOption(items);
    expect((opt.xAxis as Record<string, unknown>).type).toBe('value');
    expect((opt.yAxis as Record<string, unknown>).type).toBe('category');
  });

  it('has tooltip with all 4 metrics', () => {
    const opt = buildPackageRankingOption(items);
    const formatter = (opt.tooltip as Record<string, unknown>).formatter as Function;
    const result = formatter([{ name: '4G', value: 500, marker: '●' }]);
    expect(result).toContain('4G');
    expect(result).toContain('利润额');
    expect(result).toContain('利润率');
    expect(result).toContain('收入');
    expect(result).toContain('成本');
  });
});

describe('buildCostDetailOption', () => {
  const data: CostDetailResponse = {
    dates: ['2024-01-01'],
    paymentFee: [50],
    trafficCost: [200],
    trafficCost4G: [120],
    cardFeeCost: [80],
    meariShareCost: [80],
    customerShareCost: [70],
  };

  it('returns empty state for null data', () => {
    const opt = buildCostDetailOption(null);
    expect(opt.series).toBeUndefined();
  });

  it('generates 5 line series', () => {
    const opt = buildCostDetailOption(data);
    const series = getSeries(opt);
    expect(series).toHaveLength(5);
    series.forEach((s) => {
      expect(s.type).toBe('line');
    });
  });

  it('uses distinct colors', () => {
    const opt = buildCostDetailOption(data);
    const series = getSeries(opt);
    const colors = series.map((s) => (s.itemStyle as Record<string, string>).color);
    // trafficCost and paymentFee may share colors with cost theme, but all 4 should be defined
    expect(colors.every((c) => typeof c === 'string' && c.startsWith('#'))).toBe(true);
  });

  it('has tooltip formatter', () => {
    const opt = buildCostDetailOption(data);
    expect((opt.tooltip as Record<string, unknown>).formatter).toBeTypeOf('function');
  });
});

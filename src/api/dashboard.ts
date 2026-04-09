/**
 * Dashboard API 请求函数
 *
 * 当前使用 mock 数据进行演示。
 * 接入真实 API 时，将 USE_MOCK 设为 false 即可切换到真实请求。
 */
import apiClient from './client';
import type {
  DashboardFilters,
  KPIResponse,
  MainTrendResponse,
  CostStructureResponse,
  RevenueStructureResponse,
  WaterfallResponse,
  PackageRankingResponse,
  CostDetailResponse,
  AlertResponse,
  RevenueForecastV2Response,
} from '../types/dashboard';
import {
  mockKPI,
  mockMainTrend,
  mockCostStructure,
  mockRevenueStructure,
  mockWaterfall,
  mockPackageRanking,
  mockCostDetail,
  mockAlerts,
  mockMainTrend8W,
  mockCostStructure8W,
  mockRevenueStructure8W,
  mockCostDetail8W,
  mockMainTrend6M,
  mockCostStructure6M,
  mockRevenueStructure6M,
  mockCostDetail6M,
  mockRevenueForecastV2,
  mockRevenueForecastV28W,
  mockRevenueForecastV26M,
} from './mockData';
import {
  aggregateByWeek,
  aggregateByWeekAvg,
  aggregateByMonth,
  aggregateByMonthAvg,
  getLatestPeriodSum,
  getLatestPeriodAvg,
  getWeekStart,
  getMonthStart,
} from '../utils/timeAggregation';

// ★ 切换此标志即可在 mock 和真实 API 之间切换
const USE_MOCK = true;

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 根据 dateRange 过滤日期和对应的数值数组
 * 历史部分（forecastStartIndex 之前）按 startDate~endDate 过滤
 * 预测部分（forecastStartIndex 之后）始终全部保留
 */
function filterDateRange(
  dates: string[],
  startDate: string,
  endDate: string,
  originalForecastStart?: number,
): { startIdx: number; endIdx: number; forecastStartIndex?: number } {
  let startIdx = dates.findIndex(d => d >= startDate);
  if (startIdx === -1) startIdx = 0;

  // endIdx：如果有预测数据，endDate 只截断历史部分，预测部分全部保留
  let endIdx: number;
  if (originalForecastStart != null && originalForecastStart > 0) {
    // 历史部分截止到 endDate 或 forecastStartIndex（取较大者确保预测全保留）
    let historyEnd = dates.findIndex(d => d > endDate);
    if (historyEnd === -1) historyEnd = dates.length;
    // 始终包含全部预测数据
    endIdx = dates.length;
    // 但 startIdx 不能超过 historyEnd
    if (startIdx > historyEnd) startIdx = historyEnd;
  } else {
    endIdx = dates.findIndex(d => d > endDate);
    if (endIdx === -1) endIdx = dates.length;
  }

  const newForecastStart = originalForecastStart != null
    ? Math.max(0, Math.min(originalForecastStart - startIdx, endIdx - startIdx))
    : undefined;

  return { startIdx, endIdx, forecastStartIndex: newForecastStart };
}

function filtersToParams(filters: DashboardFilters): Record<string, string> {
  return {
    startDate: filters.dateRange[0],
    endDate: filters.dateRange[1],
    timeGranularity: filters.timeGranularity,
    orderTypes: filters.orderTypes.join(','),
    deviceTypes: filters.deviceTypes.join(','),
    productTypes: filters.productTypes.join(','),
    packageVersions: filters.packageVersions.join(','),
  };
}

/** Pick the right mock data source based on granularity */
function pickMainTrend(g: string) {
  if (g === 'month') return mockMainTrend6M;
  if (g === 'week') return mockMainTrend8W;
  return mockMainTrend;
}
function pickCostStructure(g: string) {
  if (g === 'month') return mockCostStructure6M;
  if (g === 'week') return mockCostStructure8W;
  return mockCostStructure;
}
function pickRevenueStructure(g: string) {
  if (g === 'month') return mockRevenueStructure6M;
  if (g === 'week') return mockRevenueStructure8W;
  return mockRevenueStructure;
}
function pickCostDetail(g: string) {
  if (g === 'month') return mockCostDetail6M;
  if (g === 'week') return mockCostDetail8W;
  return mockCostDetail;
}
function pickRevenueForecastV2(g: string) {
  if (g === 'month') return mockRevenueForecastV26M;
  if (g === 'week') return mockRevenueForecastV28W;
  return mockRevenueForecastV2;
}

/** Aggregate a time-series response by granularity (sum for amounts, avg for rates) */
function aggregateTrendSeries(
  dates: string[],
  values: number[],
  g: 'day' | 'week' | 'month',
  mode: 'sum' | 'avg' = 'sum',
): { dates: string[]; values: number[]; dateRanges: string[] } {
  if (g === 'day') return { dates, values, dateRanges: [] };
  if (g === 'week') return mode === 'avg' ? aggregateByWeekAvg(dates, values) : aggregateByWeek(dates, values);
  return mode === 'avg' ? aggregateByMonthAvg(dates, values) : aggregateByMonth(dates, values);
}

/**
 * 计算周/月聚合后的 forecastStartIndex
 * 原始日期数组中 forecastStartIndex 对应的日期，在聚合后落入哪个 bucket
 */
function computeAggregatedForecastIndex(
  originalDates: string[],
  originalForecastStart: number | undefined,
  g: 'day' | 'week' | 'month',
  aggregatedDates: string[],
): number | undefined {
  if (originalForecastStart == null || originalForecastStart <= 0) return undefined;
  if (g === 'day') return originalForecastStart;

  // 预测起点日期
  const forecastDate = originalDates[originalForecastStart];
  if (!forecastDate) return undefined;

  // 预测起点所在的聚合 bucket key
  const getStart = g === 'week' ? getWeekStart : getMonthStart;
  const forecastBucketKey = getStart(forecastDate);

  // 遍历原始日期，按顺序收集 bucket keys（保持顺序）
  const bucketOrder: string[] = [];
  const seen = new Set<string>();
  for (const d of originalDates) {
    const key = getStart(d);
    if (!seen.has(key)) {
      seen.add(key);
      bucketOrder.push(key);
    }
  }

  // 找到 forecastBucketKey 在 bucketOrder 中的索引
  const idx = bucketOrder.indexOf(forecastBucketKey);
  if (idx === -1) return undefined;
  // 确保不超过聚合后的日期数组长度
  return Math.min(idx, aggregatedDates.length);
}

export async function fetchKPI(
  filters: DashboardFilters,
): Promise<KPIResponse> {
  if (USE_MOCK) {
    await delay();
    const g = filters.timeGranularity;
    const src = pickMainTrend(g);
    const dates = src.dates;
    return {
      confirmedRevenue: {
        value: getLatestPeriodSum(dates, src.confirmedRevenue, g),
        changePercent: mockKPI.confirmedRevenue.changePercent,
        sparkline: mockKPI.confirmedRevenue.sparkline,
      },
      meariSales: {
        value: getLatestPeriodSum(dates, src.meariSales, g),
        changePercent: mockKPI.meariSales.changePercent,
        sparkline: mockKPI.meariSales.sparkline,
      },
      costPrediction: {
        value: getLatestPeriodSum(dates, src.costPrediction, g),
        changePercent: mockKPI.costPrediction.changePercent,
        sparkline: mockKPI.costPrediction.sparkline,
      },
      profitPrediction: {
        value: getLatestPeriodSum(dates, src.profitPrediction, g),
        changePercent: mockKPI.profitPrediction.changePercent,
        sparkline: mockKPI.profitPrediction.sparkline,
      },
      profitMargin: {
        value: getLatestPeriodAvg(dates, src.profitMargin.map((v) => v / 100), g),
        changePercent: mockKPI.profitMargin.changePercent,
        sparkline: mockKPI.profitMargin.sparkline,
      },
      topProfitPackage: mockKPI.topProfitPackage,
      topMarginPackage: mockKPI.topMarginPackage,
    };
  }
  const { data } = await apiClient.get<KPIResponse>('/kpi', {
    params: filtersToParams(filters),
  });
  return data;
}

export async function fetchMainTrend(
  filters: DashboardFilters,
): Promise<MainTrendResponse> {
  if (USE_MOCK) {
    await delay();
    const g = filters.timeGranularity;
    const src = pickMainTrend(g);
    if (g === 'day') {
      const { startIdx, endIdx, forecastStartIndex: fsi } = filterDateRange(src.dates, filters.dateRange[0], filters.dateRange[1], src.forecastStartIndex);
      return {
        dates: src.dates.slice(startIdx, endIdx),
        confirmedRevenue: src.confirmedRevenue.slice(startIdx, endIdx),
        meariSales: src.meariSales.slice(startIdx, endIdx),
        costPrediction: src.costPrediction.slice(startIdx, endIdx),
        profitPrediction: src.profitPrediction.slice(startIdx, endIdx),
        profitMargin: src.profitMargin.slice(startIdx, endIdx),
        forecastStartIndex: fsi,
      };
    }

    const aggRevenue = aggregateTrendSeries(src.dates, src.confirmedRevenue, g);
    const aggMeariSales = aggregateTrendSeries(src.dates, src.meariSales, g);
    const aggCost = aggregateTrendSeries(src.dates, src.costPrediction, g);
    const aggProfit = aggregateTrendSeries(src.dates, src.profitPrediction, g);
    const aggMargin = aggregateTrendSeries(src.dates, src.profitMargin, g, 'avg');

    return {
      dates: aggRevenue.dates,
      confirmedRevenue: aggRevenue.values,
      meariSales: aggMeariSales.values,
      costPrediction: aggCost.values,
      profitPrediction: aggProfit.values,
      profitMargin: aggMargin.values,
      dateRanges: aggRevenue.dateRanges,
      forecastStartIndex: computeAggregatedForecastIndex(src.dates, src.forecastStartIndex, g, aggRevenue.dates),
    };
  }
  const { data } = await apiClient.get<MainTrendResponse>('/main-trend', {
    params: filtersToParams(filters),
  });
  return data;
}

export async function fetchCostStructure(
  filters: DashboardFilters,
): Promise<CostStructureResponse> {
  if (USE_MOCK) {
    await delay();
    const g = filters.timeGranularity;
    const src = pickCostStructure(g);
    if (g === 'day') {
      const { startIdx, endIdx, forecastStartIndex: fsi } = filterDateRange(src.dates, filters.dateRange[0], filters.dateRange[1], src.forecastStartIndex);
      return {
        dates: src.dates.slice(startIdx, endIdx),
        serverCost: src.serverCost.slice(startIdx, endIdx),
        trafficCost: src.trafficCost.slice(startIdx, endIdx),
        trafficCost4G: src.trafficCost4G.slice(startIdx, endIdx),
        cardFeeCost: src.cardFeeCost.slice(startIdx, endIdx),
        paymentFee: src.paymentFee.slice(startIdx, endIdx),
        meariShareCost: src.meariShareCost.slice(startIdx, endIdx),
        customerShareCost: src.customerShareCost.slice(startIdx, endIdx),
        forecastStartIndex: fsi,
      };
    }

    const agg = (vals: number[]) => aggregateTrendSeries(src.dates, vals, g);
    const aggResult = agg(src.serverCost);
    return {
      dates: aggResult.dates,
      serverCost: aggResult.values,
      trafficCost: agg(src.trafficCost).values,
      trafficCost4G: agg(src.trafficCost4G).values,
      cardFeeCost: agg(src.cardFeeCost).values,
      paymentFee: agg(src.paymentFee).values,
      meariShareCost: agg(src.meariShareCost).values,
      customerShareCost: agg(src.customerShareCost).values,
      dateRanges: aggResult.dateRanges,
      forecastStartIndex: computeAggregatedForecastIndex(src.dates, src.forecastStartIndex, g, aggResult.dates),
    };
  }
  const { data } = await apiClient.get<CostStructureResponse>(
    '/cost-structure',
    { params: filtersToParams(filters) },
  );
  return data;
}

export async function fetchRevenueStructure(
  filters: DashboardFilters,
): Promise<RevenueStructureResponse> {
  if (USE_MOCK) {
    await delay();
    const g = filters.timeGranularity;
    const src = pickRevenueStructure(g);
    if (g === 'day') {
      const { startIdx, endIdx, forecastStartIndex: fsi } = filterDateRange(src.dates, filters.dateRange[0], filters.dateRange[1], src.forecastStartIndex);
      return {
        dates: src.dates.slice(startIdx, endIdx),
        meariRevenue: src.meariRevenue.slice(startIdx, endIdx),
        customerRevenue: src.customerRevenue.slice(startIdx, endIdx),
        totalConfirmedRevenue: src.totalConfirmedRevenue.slice(startIdx, endIdx),
        forecastStartIndex: fsi,
      };
    }

    const agg = (vals: number[]) => aggregateTrendSeries(src.dates, vals, g);
    const aggResult = agg(src.meariRevenue);
    return {
      dates: aggResult.dates,
      meariRevenue: aggResult.values,
      customerRevenue: agg(src.customerRevenue).values,
      totalConfirmedRevenue: agg(src.totalConfirmedRevenue).values,
      dateRanges: aggResult.dateRanges,
      forecastStartIndex: computeAggregatedForecastIndex(src.dates, src.forecastStartIndex, g, aggResult.dates),
    };
  }
  const { data } = await apiClient.get<RevenueStructureResponse>(
    '/revenue-structure',
    { params: filtersToParams(filters) },
  );
  return data;
}

export async function fetchWaterfall(
  filters: DashboardFilters,
): Promise<WaterfallResponse> {
  if (USE_MOCK) { await delay(); return mockWaterfall; }
  const { data } = await apiClient.get<WaterfallResponse>('/waterfall', {
    params: filtersToParams(filters),
  });
  return data;
}

export async function fetchPackageRanking(
  filters: DashboardFilters,
  dimension: 'productType' | 'packageVersion',
  metric: 'profit' | 'profitMargin' | 'revenue' | 'cost',
): Promise<PackageRankingResponse> {
  if (USE_MOCK) { await delay(); return mockPackageRanking; }
  const { data } = await apiClient.get<PackageRankingResponse>(
    '/package-ranking',
    { params: { ...filtersToParams(filters), dimension, metric } },
  );
  return data;
}

export async function fetchCostDetail(
  filters: DashboardFilters,
): Promise<CostDetailResponse> {
  if (USE_MOCK) {
    await delay();
    const g = filters.timeGranularity;
    const src = pickCostDetail(g);
    if (g === 'day') {
      const { startIdx, endIdx, forecastStartIndex: fsi } = filterDateRange(src.dates, filters.dateRange[0], filters.dateRange[1], src.forecastStartIndex);
      return {
        dates: src.dates.slice(startIdx, endIdx),
        paymentFee: src.paymentFee.slice(startIdx, endIdx),
        trafficCost: src.trafficCost.slice(startIdx, endIdx),
        trafficCost4G: src.trafficCost4G.slice(startIdx, endIdx),
        cardFeeCost: src.cardFeeCost.slice(startIdx, endIdx),
        meariShareCost: src.meariShareCost.slice(startIdx, endIdx),
        customerShareCost: src.customerShareCost.slice(startIdx, endIdx),
        forecastStartIndex: fsi,
      };
    }

    const agg = (vals: number[]) => aggregateTrendSeries(src.dates, vals, g);
    const aggResult = agg(src.paymentFee);
    return {
      dates: aggResult.dates,
      paymentFee: aggResult.values,
      trafficCost: agg(src.trafficCost).values,
      trafficCost4G: agg(src.trafficCost4G).values,
      cardFeeCost: agg(src.cardFeeCost).values,
      meariShareCost: agg(src.meariShareCost).values,
      customerShareCost: agg(src.customerShareCost).values,
      dateRanges: aggResult.dateRanges,
      forecastStartIndex: computeAggregatedForecastIndex(src.dates, src.forecastStartIndex, g, aggResult.dates),
    };
  }
  const { data } = await apiClient.get<CostDetailResponse>('/cost-detail', {
    params: filtersToParams(filters),
  });
  return data;
}

export async function fetchRevenueForecastV2(
  filters: DashboardFilters,
): Promise<RevenueForecastV2Response> {
  if (USE_MOCK) {
    await delay();
    const g = filters.timeGranularity;
    const src = pickRevenueForecastV2(g);
    if (g === 'day') {
      const { startIdx, endIdx, forecastStartIndex: fsi } = filterDateRange(src.dates, filters.dateRange[0], filters.dateRange[1], src.forecastStartIndex);
      return {
        dates: src.dates.slice(startIdx, endIdx),
        crossPeriodRevenue: src.crossPeriodRevenue.slice(startIdx, endIdx),
        newMonthRevenue: src.newMonthRevenue.slice(startIdx, endIdx),
        totalConfirmedRevenue: src.totalConfirmedRevenue.slice(startIdx, endIdx),
        forecastStartIndex: fsi,
      };
    }

    const agg = (vals: number[]) => aggregateTrendSeries(src.dates, vals, g);
    const aggResult = agg(src.crossPeriodRevenue);
    return {
      dates: aggResult.dates,
      crossPeriodRevenue: aggResult.values,
      newMonthRevenue: agg(src.newMonthRevenue).values,
      totalConfirmedRevenue: agg(src.totalConfirmedRevenue).values,
      dateRanges: aggResult.dateRanges,
      forecastStartIndex: computeAggregatedForecastIndex(src.dates, src.forecastStartIndex, g, aggResult.dates),
    };
  }
  const { data } = await apiClient.get<RevenueForecastV2Response>(
    '/revenue-forecast-v2',
    { params: filtersToParams(filters) },
  );
  return data;
}

export async function fetchAlerts(
  filters: DashboardFilters,
): Promise<AlertResponse> {
  if (USE_MOCK) { await delay(); return mockAlerts; }
  const { data } = await apiClient.get<AlertResponse>('/alerts', {
    params: filtersToParams(filters),
  });
  return data;
}

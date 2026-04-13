/**
 * Mock 数据 - 用于前端预览和演示
 * 支持历史+预测双段展示：历史数据波动小，预测数据波动大
 * 接入真实 API 后可删除此文件
 */
import type {
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

// ============================================================
// 日期与数据生成工具
// ============================================================

/** 生成历史+预测日期数组 */
function generateHistoryAndForecastDates(historyDays: number, forecastDays: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  // 历史部分：从 historyDays 天前到昨天
  for (let i = historyDays; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  // 预测部分：从今天开始往后 forecastDays 天
  for (let i = 0; i < forecastDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** 生成带波动的随机数组（历史部分 variance 较小，预测部分 variance 乘 1.3） */
function generateSeriesWithForecast(
  base: number,
  variance: number,
  historyLen: number,
  forecastLen: number,
): number[] {
  const total = historyLen + forecastLen;
  return Array.from({ length: total }, (_, i) => {
    const isForecast = i >= historyLen;
    const v = isForecast ? variance * 1.3 : variance;
    const trend = base + (i / total) * v * 0.3;
    const noise = (Math.random() - 0.5) * v;
    return Math.round((trend + noise) * 100) / 100;
  });
}

// ============================================================
// 日粒度数据集：90天历史 + 90天预测 = 180天
// ============================================================
const HISTORY_DAYS = 90;
const FORECAST_DAYS = 90;
const DATES = generateHistoryAndForecastDates(HISTORY_DAYS, FORECAST_DAYS);
const FORECAST_START = HISTORY_DAYS; // = 90

// ============================================================
// 8周数据集：56天历史 + 56天预测 = 112天
// ============================================================
const HISTORY_DAYS_8W = 56;
const FORECAST_DAYS_8W = 56;
const DATES_8W = generateHistoryAndForecastDates(HISTORY_DAYS_8W, FORECAST_DAYS_8W);
const FORECAST_START_8W = HISTORY_DAYS_8W; // = 56

// ============================================================
// 6个月数据集：180天历史 + 90天预测 = 270天
// ============================================================
const HISTORY_DAYS_6M = 180;
const FORECAST_DAYS_6M = 90;
const DATES_6M = generateHistoryAndForecastDates(HISTORY_DAYS_6M, FORECAST_DAYS_6M);
const FORECAST_START_6M = HISTORY_DAYS_6M; // = 180

// ============================================================
// KPI 数据
// ============================================================
export const mockKPI: KPIResponse = {
  confirmedRevenue: {
    value: 856432.50,
    changePercent: 0.052,
    sparkline: generateSeriesWithForecast(800000, 100000, 10, 4),
  },
  meariSales: {
    value: 1250000,
    changePercent: 0.065,
    sparkline: generateSeriesWithForecast(1200000, 150000, 10, 4),
  },
  costPrediction: {
    value: 523180.30,
    changePercent: 0.018,
    sparkline: generateSeriesWithForecast(500000, 60000, 10, 4),
  },
  profitPrediction: {
    value: 333252.20,
    changePercent: 0.098,
    sparkline: generateSeriesWithForecast(300000, 80000, 10, 4),
  },
  profitMargin: {
    value: 0.389,
    changePercent: 0.035,
    sparkline: generateSeriesWithForecast(0.35, 0.08, 10, 4),
  },
  topProfitPackage: { productType: '云存+AI', value: 128500, changePercent: 0.12 },
  topMarginPackage: { productType: '云存', value: 0.52, changePercent: 0.03 },
};

// ============================================================
// 日粒度 Mock 数据（90天历史 + 90天预测）
// ============================================================
export const mockMainTrend: MainTrendResponse = {
  dates: DATES,
  confirmedRevenue: generateSeriesWithForecast(850000, 120000, HISTORY_DAYS, FORECAST_DAYS),
  meariSales: generateSeriesWithForecast(1250000, 180000, HISTORY_DAYS, FORECAST_DAYS),
  costPrediction: generateSeriesWithForecast(520000, 80000, HISTORY_DAYS, FORECAST_DAYS),
  profitPrediction: generateSeriesWithForecast(330000, 90000, HISTORY_DAYS, FORECAST_DAYS),
  profitMargin: generateSeriesWithForecast(38, 8, HISTORY_DAYS, FORECAST_DAYS),
  forecastStartIndex: FORECAST_START,
};

export const mockCostStructure: CostStructureResponse = {
  dates: DATES,
  serverCost: generateSeriesWithForecast(180000, 30000, HISTORY_DAYS, FORECAST_DAYS),
  trafficCost: generateSeriesWithForecast(120000, 25000, HISTORY_DAYS, FORECAST_DAYS),
  trafficCost4G: generateSeriesWithForecast(75000, 15000, HISTORY_DAYS, FORECAST_DAYS),
  cardFeeCost: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS, FORECAST_DAYS),
  paymentFee: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS, FORECAST_DAYS),
  meariShareCost: generateSeriesWithForecast(95000, 20000, HISTORY_DAYS, FORECAST_DAYS),
  customerShareCost: generateSeriesWithForecast(83000, 18000, HISTORY_DAYS, FORECAST_DAYS),
  forecastStartIndex: FORECAST_START,
};

export const mockRevenueStructure: RevenueStructureResponse = {
  dates: DATES,
  meariRevenue: generateSeriesWithForecast(520000, 80000, HISTORY_DAYS, FORECAST_DAYS),
  customerRevenue: generateSeriesWithForecast(330000, 60000, HISTORY_DAYS, FORECAST_DAYS),
  totalConfirmedRevenue: generateSeriesWithForecast(850000, 120000, HISTORY_DAYS, FORECAST_DAYS),
  forecastStartIndex: FORECAST_START,
};

export const mockWaterfall: WaterfallResponse = {
  totalRevenue: 856432.50,
  serverCost: 180200,
  trafficCost: 121500,
  trafficCost4G: 72900,
  cardFeeCost: 48600,
  paymentFee: 45300,
  meariShareCost: 95680,
  customerShareCost: 80500,
  profit: 333252.50,
};

export const mockPackageRanking: PackageRankingResponse = {
  items: [
    { name: '云存+AI', profit: 128500, profitMargin: 0.48, revenue: 267700, cost: 139200 },
    { name: '云存', profit: 95200, profitMargin: 0.52, revenue: 183100, cost: 87900 },
    { name: '云+4G', profit: 62300, profitMargin: 0.31, revenue: 200900, cost: 138600 },
    { name: '4G', profit: 31800, profitMargin: 0.22, revenue: 144500, cost: 112700 },
    { name: 'AI', profit: 15452, profitMargin: 0.26, revenue: 59400, cost: 43948 },
  ],
};

export const mockCostDetail: CostDetailResponse = {
  dates: DATES,
  paymentFee: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS, FORECAST_DAYS),
  trafficCost: generateSeriesWithForecast(120000, 25000, HISTORY_DAYS, FORECAST_DAYS),
  trafficCost4G: generateSeriesWithForecast(75000, 15000, HISTORY_DAYS, FORECAST_DAYS),
  cardFeeCost: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS, FORECAST_DAYS),
  meariShareCost: generateSeriesWithForecast(95000, 20000, HISTORY_DAYS, FORECAST_DAYS),
  customerShareCost: generateSeriesWithForecast(83000, 18000, HISTORY_DAYS, FORECAST_DAYS),
  forecastStartIndex: FORECAST_START,
};

import { getCurrentLocaleLabels } from '../i18n/I18nContext';

export function getMockAlerts(): AlertResponse {
  const t = getCurrentLocaleLabels();
  return {
    alerts: [
      {
        id: 'alert-1',
        type: 'profitMargin',
        severity: 'critical',
        title: t.alertProfitBelowThreshold,
        productType: '4G',
        currentValue: 0.05,
        threshold: 0.1,
      },
      {
        id: 'alert-2',
        type: 'paymentFee',
        severity: 'warning',
        title: t.alertPaymentFeeRise,
        currentValue: 0.08,
        threshold: 0.05,
        changePercent: 0.08,
      },
      {
        id: 'alert-3',
        type: 'trafficCost',
        severity: 'warning',
        title: t.alertTrafficCostRise,
        deviceType: 'IPC',
        currentValue: 0.15,
        threshold: 0.1,
        changePercent: 0.15,
      },
      {
        id: 'alert-4',
        type: 'profitMargin',
        severity: 'critical',
        title: t.alertProfitBelowThreshold,
        productType: t.cloud4G,
        currentValue: 0.08,
        threshold: 0.1,
      },
    ],
  };
}

export const mockAlerts: AlertResponse = getMockAlerts();

export const mockRevenueForecastV2: RevenueForecastV2Response = {
  dates: DATES,
  crossPeriodRevenue: generateSeriesWithForecast(550000, 80000, HISTORY_DAYS, FORECAST_DAYS),
  newMonthRevenue: generateSeriesWithForecast(300000, 60000, HISTORY_DAYS, FORECAST_DAYS),
  totalConfirmedRevenue: generateSeriesWithForecast(850000, 120000, HISTORY_DAYS, FORECAST_DAYS),
  forecastStartIndex: FORECAST_START,
};

// ============================================================
// 8 周数据集（56天历史 + 56天预测 = 112天，用于周粒度聚合）
// ============================================================
export const mockMainTrend8W: MainTrendResponse = {
  dates: DATES_8W,
  confirmedRevenue: generateSeriesWithForecast(850000, 120000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  meariSales: generateSeriesWithForecast(1250000, 180000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  costPrediction: generateSeriesWithForecast(520000, 80000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  profitPrediction: generateSeriesWithForecast(330000, 90000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  profitMargin: generateSeriesWithForecast(38, 8, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  forecastStartIndex: FORECAST_START_8W,
};

export const mockCostStructure8W: CostStructureResponse = {
  dates: DATES_8W,
  serverCost: generateSeriesWithForecast(180000, 30000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  trafficCost: generateSeriesWithForecast(120000, 25000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  trafficCost4G: generateSeriesWithForecast(75000, 15000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  cardFeeCost: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  paymentFee: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  meariShareCost: generateSeriesWithForecast(95000, 20000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  customerShareCost: generateSeriesWithForecast(83000, 18000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  forecastStartIndex: FORECAST_START_8W,
};

export const mockRevenueStructure8W: RevenueStructureResponse = {
  dates: DATES_8W,
  meariRevenue: generateSeriesWithForecast(520000, 80000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  customerRevenue: generateSeriesWithForecast(330000, 60000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  totalConfirmedRevenue: generateSeriesWithForecast(850000, 120000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  forecastStartIndex: FORECAST_START_8W,
};

export const mockCostDetail8W: CostDetailResponse = {
  dates: DATES_8W,
  paymentFee: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  trafficCost: generateSeriesWithForecast(120000, 25000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  trafficCost4G: generateSeriesWithForecast(75000, 15000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  cardFeeCost: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  meariShareCost: generateSeriesWithForecast(95000, 20000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  customerShareCost: generateSeriesWithForecast(83000, 18000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  forecastStartIndex: FORECAST_START_8W,
};

export const mockRevenueForecastV28W: RevenueForecastV2Response = {
  dates: DATES_8W,
  crossPeriodRevenue: generateSeriesWithForecast(550000, 80000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  newMonthRevenue: generateSeriesWithForecast(300000, 60000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  totalConfirmedRevenue: generateSeriesWithForecast(850000, 120000, HISTORY_DAYS_8W, FORECAST_DAYS_8W),
  forecastStartIndex: FORECAST_START_8W,
};

// ============================================================
// 6 个月数据集（180天历史 + 90天预测 = 270天，用于月粒度聚合）
// ============================================================
export const mockMainTrend6M: MainTrendResponse = {
  dates: DATES_6M,
  confirmedRevenue: generateSeriesWithForecast(850000, 150000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  meariSales: generateSeriesWithForecast(1250000, 200000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  costPrediction: generateSeriesWithForecast(520000, 100000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  profitPrediction: generateSeriesWithForecast(330000, 110000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  profitMargin: generateSeriesWithForecast(38, 10, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  forecastStartIndex: FORECAST_START_6M,
};

export const mockCostStructure6M: CostStructureResponse = {
  dates: DATES_6M,
  serverCost: generateSeriesWithForecast(180000, 40000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  trafficCost: generateSeriesWithForecast(120000, 30000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  trafficCost4G: generateSeriesWithForecast(75000, 15000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  cardFeeCost: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  paymentFee: generateSeriesWithForecast(45000, 12000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  meariShareCost: generateSeriesWithForecast(95000, 25000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  customerShareCost: generateSeriesWithForecast(83000, 22000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  forecastStartIndex: FORECAST_START_6M,
};

export const mockRevenueStructure6M: RevenueStructureResponse = {
  dates: DATES_6M,
  meariRevenue: generateSeriesWithForecast(520000, 100000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  customerRevenue: generateSeriesWithForecast(330000, 80000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  totalConfirmedRevenue: generateSeriesWithForecast(850000, 150000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  forecastStartIndex: FORECAST_START_6M,
};

export const mockCostDetail6M: CostDetailResponse = {
  dates: DATES_6M,
  paymentFee: generateSeriesWithForecast(45000, 12000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  trafficCost: generateSeriesWithForecast(120000, 30000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  trafficCost4G: generateSeriesWithForecast(75000, 15000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  cardFeeCost: generateSeriesWithForecast(45000, 10000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  meariShareCost: generateSeriesWithForecast(95000, 25000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  customerShareCost: generateSeriesWithForecast(83000, 22000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  forecastStartIndex: FORECAST_START_6M,
};

export const mockRevenueForecastV26M: RevenueForecastV2Response = {
  dates: DATES_6M,
  crossPeriodRevenue: generateSeriesWithForecast(550000, 100000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  newMonthRevenue: generateSeriesWithForecast(300000, 80000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  totalConfirmedRevenue: generateSeriesWithForecast(850000, 150000, HISTORY_DAYS_6M, FORECAST_DAYS_6M),
  forecastStartIndex: FORECAST_START_6M,
};

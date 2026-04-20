/** 简化版看板 Mock 数据 */
import type {
  SimpleKPIResponse, SimpleMainTrendResponse, SimpleCrossPeriodResponse,
  SimpleNewMonthPackageResponse, SimpleCollectionResponse, SimpleAlertResponse,
} from '../types/simpleDashboard';
import { getCurrentLocaleLabels } from '../i18n/I18nContext';

const HISTORY_DAYS = 90;
const FORECAST_DAYS = 30;
const TOTAL_DAYS = HISTORY_DAYS + FORECAST_DAYS;
const FORECAST_START = HISTORY_DAYS;

function genDates(total: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - HISTORY_DAYS + 1);
  for (let i = 0; i < total; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function genSeries(base: number, variance: number, len: number): number[] {
  return Array.from({ length: len }, () => base + (Math.random() - 0.5) * variance * 2);
}

const DATES = genDates(TOTAL_DAYS);

export const simpleMockKPI: SimpleKPIResponse = {
  orderAmount: { value: 1520000, changePercent: 0.05, sparkline: genSeries(1500000, 100000, 7) },
  meariSales: { value: 1280000, changePercent: 0.03, sparkline: genSeries(1280000, 80000, 7) },
  confirmedRevenue: { value: 920000, changePercent: 0.02, sparkline: genSeries(920000, 60000, 7) },
  newMonthConfirmed: { value: 380000, changePercent: 0.04, sparkline: genSeries(380000, 30000, 7) },
};

export const simpleMockMainTrend: SimpleMainTrendResponse = {
  dates: DATES,
  orderAmount: genSeries(1500000, 150000, TOTAL_DAYS),
  meariSales: genSeries(1280000, 100000, TOTAL_DAYS),
  confirmedRevenue: genSeries(920000, 80000, TOTAL_DAYS),
  forecastStartIndex: FORECAST_START,
};

export const simpleMockCrossPeriod: SimpleCrossPeriodResponse = {
  dates: DATES,
  crossPeriodRevenue: genSeries(550000, 60000, TOTAL_DAYS),
  newMonthConfirmed: genSeries(380000, 40000, TOTAL_DAYS),
  newMonthOrderAmount: genSeries(800000, 80000, TOTAL_DAYS),
  forecastStartIndex: FORECAST_START,
};

export const simpleMockNewMonthPkg: SimpleNewMonthPackageResponse = {
  dates: DATES,
  totalOrderAmount: genSeries(1500000, 150000, TOTAL_DAYS),
  yearlyOrderAmount: genSeries(900000, 90000, TOTAL_DAYS),
  newMonthYearlyConfirmed: genSeries(220000, 25000, TOTAL_DAYS),
  monthlyOrderAmount: genSeries(600000, 60000, TOTAL_DAYS),
  newMonthMonthlyConfirmed: genSeries(160000, 20000, TOTAL_DAYS),
  newMonthOrderAmount: genSeries(800000, 80000, TOTAL_DAYS),
  forecastStartIndex: FORECAST_START,
};

export const simpleMockCollection: SimpleCollectionResponse = {
  dates: DATES,
  meariNewOrderAmount: genSeries(500000, 50000, TOTAL_DAYS),
  meariNewConfirmed: genSeries(250000, 30000, TOTAL_DAYS),
  customerNewOrderAmount: genSeries(300000, 35000, TOTAL_DAYS),
  customerNewConfirmed: genSeries(130000, 20000, TOTAL_DAYS),
  forecastStartIndex: FORECAST_START,
};

export function getSimpleMockAlerts(): SimpleAlertResponse {
  const t = getCurrentLocaleLabels();
  return {
    alerts: [
      { id: 'sa-1', severity: 'critical', title: t.alertOrderDrop ?? '动销订单金额较昨日异常下滑', type: 'orderAmount', currentValue: -0.12, threshold: -0.05 },
      { id: 'sa-2', severity: 'warning', title: t.alertRevenueDivergence ?? '可确认收入预测与订单金额增长趋势背离', type: 'confirmedRevenue', currentValue: -0.08, threshold: -0.05, changePercent: -0.08 },
      { id: 'sa-3', severity: 'warning', title: t.alertCrossPeriodRise ?? '跨期确认占比异常升高', type: 'confirmedRevenue', currentValue: 0.72, threshold: 0.65, changePercent: 0.07 },
    ],
  };
}

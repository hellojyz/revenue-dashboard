/**
 * 简化版看板 API 请求函数
 * 当前使用 mock 数据，300ms 延迟模拟网络请求
 */
import type { DashboardFilters } from '../types/dashboard';
import type {
  SimpleKPIResponse,
  SimpleMainTrendResponse,
  SimpleCrossPeriodResponse,
  SimpleNewMonthPackageResponse,
  SimpleCollectionResponse,
  SimpleAlertResponse,
} from '../types/simpleDashboard';
import {
  simpleMockKPI,
  simpleMockMainTrend,
  simpleMockCrossPeriod,
  simpleMockNewMonthPkg,
  simpleMockCollection,
  getSimpleMockAlerts,
} from './simpleMockData';

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchSimpleKPI(_filters: DashboardFilters): Promise<SimpleKPIResponse> {
  await delay();
  return simpleMockKPI;
}

export async function fetchSimpleMainTrend(_filters: DashboardFilters): Promise<SimpleMainTrendResponse> {
  await delay();
  return simpleMockMainTrend;
}

export async function fetchSimpleCrossPeriod(_filters: DashboardFilters): Promise<SimpleCrossPeriodResponse> {
  await delay();
  return simpleMockCrossPeriod;
}

export async function fetchSimpleNewMonthPkg(_filters: DashboardFilters): Promise<SimpleNewMonthPackageResponse> {
  await delay();
  return simpleMockNewMonthPkg;
}

export async function fetchSimpleCollection(_filters: DashboardFilters): Promise<SimpleCollectionResponse> {
  await delay();
  return simpleMockCollection;
}

export async function fetchSimpleAlerts(_filters: DashboardFilters): Promise<SimpleAlertResponse> {
  await delay();
  return getSimpleMockAlerts();
}

// ============================================================
// Dashboard Filters (全局筛选条件)
// ============================================================

export interface DashboardFilters {
  dateRange: [string, string]; // 起止日期 ISO 格式
  timeGranularity: 'day' | 'week' | 'month';
  orderTypes: string[]; // 多选
  deviceTypes: string[]; // 多选
  productTypes: string[]; // 多选
  packageVersions: string[]; // 多选
  sourceApps: string[]; // 多选
  factories: string[]; // 多选
  sellers: string[]; // 多选
  tpList: string[]; // 多选
}

// ============================================================
// API Response Types (API 响应类型)
// ============================================================

/** KPI 单项指标 */
export interface KPIMetric {
  value: number;
  changePercent: number; // 环比变化百分比
  sparkline: number[]; // 近期趋势数据点（7~30个点）
}

/** Top 套餐指标 */
export interface TopPackageMetric {
  productType: string; // 产品类型名称
  value: number; // 利润额或利润率
  changePercent: number;
}

/** KPI 指标接口响应 */
export interface KPIResponse {
  confirmedRevenue: KPIMetric;
  meariSales: KPIMetric;
  costPrediction: KPIMetric;
  profitPrediction: KPIMetric;
  profitMargin: KPIMetric;
  topProfitPackage: TopPackageMetric;
  topMarginPackage: TopPackageMetric;
}

/** 主趋势数据接口响应 */
export interface MainTrendResponse {
  dates: string[]; // 时间轴标签
  confirmedRevenue: number[]; // 可确认收入序列
  meariSales: number[]; // 觅睿销售额序列
  costPrediction: number[]; // 成本预测序列
  profitPrediction: number[]; // 利润预测序列
  profitMargin: number[]; // 利润率序列（百分比）
  dateRanges?: string[]; // 周/月粒度下的实际统计周期范围
  forecastStartIndex?: number; // 预测数据起始索引
}

/** 成本结构数据接口响应 */
export interface CostStructureResponse {
  dates: string[];
  serverCost: number[];
  trafficCost: number[];
  trafficCost4G: number[];
  cardFeeCost: number[];
  paymentFee: number[];
  meariShareCost: number[];
  customerShareCost: number[];
  dateRanges?: string[]; // 周/月粒度下的实际统计周期范围
  forecastStartIndex?: number; // 预测数据起始索引
}

/** 收入结构数据接口响应 */
export interface RevenueStructureResponse {
  dates: string[];
  meariRevenue: number[];
  customerRevenue: number[];
  totalConfirmedRevenue: number[];
  dateRanges?: string[]; // 周/月粒度下的实际统计周期范围
  forecastStartIndex?: number; // 预测数据起始索引
}

/** 瀑布图数据接口响应 */
export interface WaterfallResponse {
  totalRevenue: number;
  serverCost: number;
  trafficCost: number;
  trafficCost4G: number;
  cardFeeCost: number;
  paymentFee: number;
  meariShareCost: number;
  customerShareCost: number;
  profit: number;
}

/** 套餐盈利排行单项 */
export interface PackageRankingItem {
  name: string; // 产品类型或套餐版本名称
  profit: number;
  profitMargin: number;
  revenue: number;
  cost: number;
}

/** 套餐盈利排行接口响应 */
export interface PackageRankingResponse {
  items: PackageRankingItem[];
}

/** 成本专项分析接口响应 */
export interface CostDetailResponse {
  dates: string[];
  paymentFee: number[];
  trafficCost: number[];
  trafficCost4G: number[];
  cardFeeCost: number[];
  meariShareCost: number[];
  customerShareCost: number[];
  dateRanges?: string[]; // 周/月粒度下的实际统计周期范围
  forecastStartIndex?: number; // 预测数据起始索引
}

/** 收入预测分析看板2 接口响应 */
export interface RevenueForecastV2Response {
  dates: string[];
  crossPeriodRevenue: number[];    // 跨期可确认收入预测
  newMonthRevenue: number[];       // 当月新增可确认收入预测
  totalConfirmedRevenue: number[]; // 总可确认收入预测
  dateRanges?: string[];
  forecastStartIndex?: number; // 预测数据起始索引
}

/** 单个告警项 */
export interface AlertItem {
  id: string;
  type: 'profitMargin' | 'paymentFee' | 'trafficCost';
  severity: 'warning' | 'critical';
  title: string;
  productType?: string;
  deviceType?: string;
  currentValue: number;
  threshold: number;
  changePercent?: number;
}

/** 异常告警接口响应 */
export interface AlertResponse {
  alerts: AlertItem[];
}

// ============================================================
// Alert Thresholds (告警阈值配置)
// ============================================================

export interface AlertThresholds {
  profitMarginMin: number; // 利润率最低阈值（如 0.1 = 10%）
  paymentFeeChangeMax: number; // 手续费率环比变化最大阈值（如 0.05 = 5%）
  trafficCostPerDeviceChangeMax: number; // 单设备流量成本环比变化最大阈值
}

// ============================================================
// Component Props Types (组件 Props 类型)
// ============================================================

export interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  changePercent: number; // 环比变化百分比，正值为增长，负值为下降
  sparklineData: number[]; // 迷你折线图数据点
  highlighted?: boolean; // 是否为突出展示样式
  subtitle?: string; // 统计周期描述（周/月粒度下显示）
}

export interface AlertCardProps {
  severity: 'warning' | 'critical'; // 橙色 | 红色
  title: string; // 告警标题
  productType?: string; // 异常产品类型
  currentValue: number; // 当前值
  threshold: number; // 阈值
  changePercent?: number; // 变化幅度
}

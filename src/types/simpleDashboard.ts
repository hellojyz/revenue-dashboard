/** 简化版看板 - 类型定义 */

export interface SimpleKPIResponse {
  orderAmount: { value: number; changePercent: number; sparkline: number[] };
  meariSales: { value: number; changePercent: number; sparkline: number[] };
  confirmedRevenue: { value: number; changePercent: number; sparkline: number[] };
  newMonthConfirmed: { value: number; changePercent: number; sparkline: number[] };
}

export interface SimpleMainTrendResponse {
  dates: string[];
  orderAmount: number[];        // 动销订单金额
  meariSales: number[];         // 觅睿销售额
  confirmedRevenue: number[];   // 可确认收入预测
  forecastStartIndex: number;
  dateRanges?: string[];
}

export interface SimpleCrossPeriodResponse {
  dates: string[];
  crossPeriodRevenue: number[];       // 跨期确认收入预测
  newMonthConfirmed: number[];        // 当月新增可确认收入预测
  newMonthOrderAmount: number[];      // 当月新增订单金额预测
  forecastStartIndex: number;
  dateRanges?: string[];
}

export interface SimpleNewMonthPackageResponse {
  dates: string[];
  totalOrderAmount: number[];         // 总动销订单金额
  yearlyOrderAmount: number[];        // 年包动销订单金额
  newMonthYearlyConfirmed: number[];  // 年包新增可确认预测
  monthlyOrderAmount: number[];       // 月包动销订单金额
  newMonthMonthlyConfirmed: number[]; // 月包新增可确认预测
  newMonthOrderAmount: number[];      // 当月新增订单金额预测（保留兼容）
  forecastStartIndex: number;
  dateRanges?: string[];
}

export interface SimpleCollectionResponse {
  dates: string[];
  meariNewOrderAmount: number[];      // 觅睿收款-当月新增订单金额预测
  meariNewConfirmed: number[];        // 觅睿收款-当月新增可确认收入预测
  customerNewOrderAmount: number[];   // 客户收款-当月新增订单金额预测
  customerNewConfirmed: number[];     // 客户收款-当月新增可确认收入预测
  forecastStartIndex: number;
  dateRanges?: string[];
}

export interface SimpleAlertItem {
  id: string;
  severity: 'critical' | 'warning';
  title: string;
  currentValue: number;
  threshold: number;
  changePercent?: number;
  type: 'orderAmount' | 'confirmedRevenue';
}

export interface SimpleAlertResponse {
  alerts: SimpleAlertItem[];
}

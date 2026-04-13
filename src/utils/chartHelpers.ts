/**
 * 图表配置辅助函数
 * 生成各类 ECharts option 配置
 * 支持历史+预测双段展示：历史实线，预测虚线，分界线标注"预测起点"
 */

import type {
  MainTrendResponse,
  CostStructureResponse,
  RevenueStructureResponse,
  WaterfallResponse,
  PackageRankingItem,
  CostDetailResponse,
  RevenueForecastV2Response,
} from '../types/dashboard';
import { formatCurrency, formatPercent, formatLargeNumber } from './formatters';
import { getCurrentLocaleLabels } from '../i18n/I18nContext';

// ===== 颜色常量（对应 variables.css 中定义的色值）=====
const COLORS = {
  revenue: '#58a6ff',
  sales: '#e6c07b',
  cost: '#f0883e',
  profit: '#3fb950',
  profitMargin: '#bc8cff',
  serverCost: '#f97583',
  trafficCost: '#f0883e',
  trafficCost4G: '#f0883e',
  cardFeeCost: '#d4a373',
  paymentFee: '#d2a8ff',
  meariShare: '#79c0ff',
  customerShare: '#56d364',
  meariRevenue: '#58a6ff',
  customerRevenue: '#3fb950',
  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  borderColor: '#30363d',
  bgSecondary: '#161b22',
};

/** 通用深色主题 tooltip 样式 */
function baseTooltip(): Record<string, unknown> {
  return {
    trigger: 'axis',
    backgroundColor: COLORS.bgSecondary,
    borderColor: COLORS.borderColor,
    textStyle: { color: COLORS.textPrimary, fontSize: 13 },
  };
}

/** 通用深色主题 legend 样式 */
function baseLegend(data: string[]): Record<string, unknown> {
  return {
    data,
    textStyle: { color: COLORS.textSecondary },
    top: 0,
  };
}

/** 通用深色主题 grid */
function baseGrid(): Record<string, unknown> {
  return { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true };
}

/** 通用深色主题 X 轴（类目轴） */
function baseCategoryXAxis(data: string[]): Record<string, unknown> {
  return {
    type: 'category',
    data,
    axisLabel: { color: COLORS.textSecondary, fontSize: 13 },
    axisLine: { lineStyle: { color: COLORS.borderColor } },
  };
}

/** 通用深色主题 Y 轴（数值轴） */
function baseValueYAxis(name?: string): Record<string, unknown> {
  return {
    type: 'value',
    name,
    nameTextStyle: { color: COLORS.textSecondary, fontSize: 13 },
    axisLabel: { color: COLORS.textSecondary, fontSize: 13 },
    splitLine: { lineStyle: { color: COLORS.borderColor, type: 'dashed' } },
  };
}

// ============================================================
// 历史/预测拆分工具
// ============================================================

/**
 * 将一条数据线拆成历史和预测两段
 * 历史：index < forecastStartIndex 有值，其余 null
 * 预测：index >= forecastStartIndex - 1 有值（-1 重叠一个点确保连续），其余 null
 */
function splitHistoryForecast(
  data: number[],
  forecastStartIndex: number,
): { history: (number | null)[]; forecast: (number | null)[] } {
  const history = data.map((v, i) => (i < forecastStartIndex ? v : null));
  const forecast = data.map((v, i) => (i >= forecastStartIndex - 1 ? v : null));
  return { history, forecast };
}

/** 生成预测起点 markLine 配置 */
function forecastMarkLine(dates: string[], forecastStartIndex: number): Record<string, unknown> | undefined {
  if (forecastStartIndex == null || forecastStartIndex <= 0 || forecastStartIndex >= dates.length) return undefined;
  return {
    silent: true,
    symbol: ['none', 'arrow'],
    symbolSize: [0, 8],
    lineStyle: {
      color: 'rgba(255, 255, 255, 0.35)',
      type: [4, 4],
      width: 1.5,
    },
    label: {
      show: true,
      formatter: getCurrentLocaleLabels().historyForecastMark,
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 11,
      fontWeight: 500,
      position: 'insideEndTop',
      backgroundColor: 'rgba(22, 27, 34, 0.85)',
      padding: [4, 8],
      borderRadius: 4,
    },
    data: [{ xAxis: dates[forecastStartIndex] }],
  };
}


// ============================================================
// 1. 主趋势柱线组合图
// ============================================================

/**
 * 生成主趋势柱线组合图 ECharts 配置
 * 柱图：收入 + 成本，折线：利润（利润率已移至独立指示器）
 * 支持历史/预测双段展示
 * @param dateRanges 周/月粒度下每个数据点对应的实际统计周期范围
 */
export function buildMainTrendOption(data: MainTrendResponse | undefined | null, dateRanges?: string[]): Record<string, unknown> {
  if (!data || !data.dates?.length) {
    return { title: { text: getCurrentLocaleLabels().noData, left: 'center', top: 'center', textStyle: { color: COLORS.textSecondary } } };
  }

  const fsi = data.forecastStartIndex;
  const hasForecast = fsi != null && fsi > 0 && fsi < data.dates.length;

  const t = getCurrentLocaleLabels();
  const seriesDefs = [
    { name: t.confirmedRevForecast, type: 'bar', values: data.confirmedRevenue, color: COLORS.revenue },
    { name: t.meariSalesForecast, type: 'line', values: data.meariSales, color: COLORS.sales, smooth: true },
    { name: t.costForecastKPI, type: 'bar', values: data.costPrediction, color: COLORS.cost },
    { name: t.profitForecastKPI, type: 'line', values: data.profitPrediction, color: COLORS.profit, smooth: true },
  ];

  const legendNames = seriesDefs.map((s) => s.name);
  const series: Record<string, unknown>[] = [];

  for (let si = 0; si < seriesDefs.length; si++) {
    const def = seriesDefs[si];
    if (hasForecast) {
      const { history, forecast } = splitHistoryForecast(def.values, fsi!);
      // 历史 series
      const historySeries: Record<string, unknown> = {
        name: def.name,
        type: def.type,
        data: history,
        itemStyle: { color: def.color },
        ...(def.type === 'line' ? { lineStyle: { color: def.color, type: 'solid' }, smooth: def.smooth } : {}),
      };
      // 第一个 series 上添加 markLine
      if (si === 0) {
        historySeries.markLine = forecastMarkLine(data.dates, fsi!);
      }
      series.push(historySeries);
      // 预测 series（同名，虚线/半透明）
      series.push({
        name: def.name,
        type: def.type,
        data: forecast,
        itemStyle: { color: def.color, ...(def.type === 'bar' ? { opacity: 0.45 } : {}) },
        ...(def.type === 'line' ? { lineStyle: { color: def.color, type: 'dashed' }, smooth: def.smooth } : {}),
      });
    } else {
      series.push({
        name: def.name,
        type: def.type,
        data: def.values,
        itemStyle: { color: def.color },
        ...(def.type === 'line' ? { lineStyle: { color: def.color }, smooth: def.smooth } : {}),
      });
    }
  }

  return {
    tooltip: {
      ...baseTooltip(),
      formatter(params: Array<{ seriesName: string; value: number | null; marker: string; dataIndex: number }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const idx = params[0].dataIndex;
        const rangeText = dateRanges?.[idx];
        const headerLabel = rangeText ?? (params as Array<{ axisValue?: string }>)[0]?.axisValue ?? '';
        const header = `<div style="margin-bottom:4px;font-weight:bold">${headerLabel}</div>`;
        // 去重同名 series，只取有值的那个
        const seen = new Set<string>();
        const lines: string[] = [];
        for (const p of params) {
          if (p.value == null || seen.has(p.seriesName)) continue;
          seen.add(p.seriesName);
          lines.push(`${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}`);
        }
        return header + lines.join('<br/>');
      },
    },
    legend: baseLegend(legendNames),
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: baseCategoryXAxis(data.dates),
    yAxis: { ...baseValueYAxis(t.amountLabel), min: 0 },
    series,
  };
}


// ============================================================
// 2. 成本结构堆叠柱图
// ============================================================

/**
 * 生成成本结构堆叠柱图配置（6项成本堆叠）
 * 支持历史/预测双段展示
 * @param dateRanges 周/月粒度下每个数据点对应的实际统计周期范围
 */
export function buildCostStructureOption(data: CostStructureResponse | undefined | null, dateRanges?: string[]): Record<string, unknown> {
  if (!data || !data.dates?.length) {
    return { title: { text: getCurrentLocaleLabels().noData, left: 'center', top: 'center', textStyle: { color: COLORS.textSecondary } } };
  }

  const fsi = data.forecastStartIndex;
  const hasForecast = fsi != null && fsi > 0 && fsi < data.dates.length;

  const t = getCurrentLocaleLabels();
  const costNames = [t.serverCostForecast, t.traffic4GCostForecast, t.cardFeeCostForecast, t.paymentFeeForecast, t.meariShareCostForecast, t.customerShareCostForecast];
  const costColors = [COLORS.serverCost, COLORS.trafficCost4G, COLORS.cardFeeCost, COLORS.paymentFee, COLORS.meariShare, COLORS.customerShare];
  const costData = [data.serverCost, data.trafficCost4G, data.cardFeeCost, data.paymentFee, data.meariShareCost, data.customerShareCost];

  const series: Record<string, unknown>[] = [];

  for (let i = 0; i < costNames.length; i++) {
    if (hasForecast) {
      const { history, forecast } = splitHistoryForecast(costData[i], fsi!);
      const historySeries: Record<string, unknown> = {
        name: costNames[i],
        type: 'bar',
        stack: 'cost',
        data: history,
        itemStyle: { color: costColors[i] },
      };
      if (i === 0) {
        historySeries.markLine = forecastMarkLine(data.dates, fsi!);
      }
      series.push(historySeries);
      series.push({
        name: costNames[i],
        type: 'bar',
        stack: 'cost-forecast',
        data: forecast,
        itemStyle: { color: costColors[i], opacity: 0.45 },
      });
    } else {
      series.push({
        name: costNames[i],
        type: 'bar',
        stack: 'cost',
        data: costData[i],
        itemStyle: { color: costColors[i] },
      });
    }
  }

  return {
    tooltip: {
      ...baseTooltip(),
      formatter(params: Array<{ seriesName: string; value: number | null; marker: string; dataIndex: number }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const idx = params[0].dataIndex;
        const rangeText = dateRanges?.[idx];
        const headerLabel = rangeText ?? (params as Array<{ axisValue?: string }>)[0]?.axisValue ?? '';
        const header = `<div style="margin-bottom:4px;font-weight:bold">${headerLabel}</div>`;
        const seen = new Set<string>();
        const items: Array<{ name: string; value: number; marker: string }> = [];
        for (const p of params) {
          if (p.value == null || seen.has(p.seriesName)) continue;
          seen.add(p.seriesName);
          items.push({ name: p.seriesName, value: p.value, marker: p.marker });
        }
        const total = items.reduce((sum, it) => sum + (it.value || 0), 0);
        const lines = items.map((it) => {
          const pct = total > 0 ? ((it.value / total) * 100).toFixed(1) : '0.0';
          return `${it.marker} ${it.name}: ${formatCurrency(it.value)} (${pct}%)`;
        });
        return header + lines.join('<br/>');
      },
    },
    legend: baseLegend(costNames),
    grid: baseGrid(),
    xAxis: baseCategoryXAxis(data.dates),
    yAxis: { ...baseValueYAxis(t.costAmountLabel), min: 0 },
    series,
  };
}


// ============================================================
// 3. 收入结构趋势图
// ============================================================

/**
 * 生成收入结构趋势图配置（堆叠柱图：觅睿+客户，折线：总收入）
 * 支持历史/预测双段展示
 * @param dateRanges 周/月粒度下每个数据点对应的实际统计周期范围
 */
export function buildRevenueStructureOption(data: RevenueStructureResponse | undefined | null, dateRanges?: string[]): Record<string, unknown> {
  if (!data || !data.dates?.length) {
    return { title: { text: getCurrentLocaleLabels().noData, left: 'center', top: 'center', textStyle: { color: COLORS.textSecondary } } };
  }

  const fsi = data.forecastStartIndex;
  const hasForecast = fsi != null && fsi > 0 && fsi < data.dates.length;

  const t = getCurrentLocaleLabels();
  const seriesDefs = [
    { name: t.meariRevenueForecast, type: 'bar', stack: 'revenue', values: data.meariRevenue, color: COLORS.meariRevenue },
    { name: t.customerRevenueForecast, type: 'bar', stack: 'revenue', values: data.customerRevenue, color: COLORS.customerRevenue },
    { name: t.totalRevenue, type: 'line', values: data.totalConfirmedRevenue, color: COLORS.revenue, lineWidth: 2, smooth: true },
  ];

  const legendNames = seriesDefs.map((s) => s.name);
  const series: Record<string, unknown>[] = [];

  for (let si = 0; si < seriesDefs.length; si++) {
    const def = seriesDefs[si];
    if (hasForecast) {
      const { history, forecast } = splitHistoryForecast(def.values, fsi!);
      const isBar = def.type === 'bar';
      const historySeries: Record<string, unknown> = {
        name: def.name,
        type: def.type,
        ...(isBar ? { stack: def.stack } : {}),
        data: history,
        itemStyle: { color: def.color },
        ...(def.type === 'line' ? { lineStyle: { color: def.color, width: def.lineWidth ?? 1, type: 'solid' }, smooth: def.smooth } : {}),
      };
      if (si === 0) {
        historySeries.markLine = forecastMarkLine(data.dates, fsi!);
      }
      series.push(historySeries);
      series.push({
        name: def.name,
        type: def.type,
        ...(isBar ? { stack: def.stack + '-forecast' } : {}),
        data: forecast,
        itemStyle: { color: def.color, ...(isBar ? { opacity: 0.45 } : {}) },
        ...(def.type === 'line' ? { lineStyle: { color: def.color, width: def.lineWidth ?? 1, type: 'dashed' }, smooth: def.smooth } : {}),
      });
    } else {
      series.push({
        name: def.name,
        type: def.type,
        ...(def.type === 'bar' ? { stack: def.stack } : {}),
        data: def.values,
        itemStyle: { color: def.color },
        ...(def.type === 'line' ? { lineStyle: { color: def.color, width: def.lineWidth ?? 1 }, smooth: def.smooth } : {}),
      });
    }
  }

  return {
    tooltip: {
      ...baseTooltip(),
      formatter(params: Array<{ seriesName: string; value: number | null; marker: string; dataIndex: number }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const idx = params[0].dataIndex;
        const rangeText = dateRanges?.[idx];
        const headerLabel = rangeText ?? (params as Array<{ axisValue?: string }>)[0]?.axisValue ?? '';
        const header = `<div style="margin-bottom:4px;font-weight:bold">${headerLabel}</div>`;
        const seen = new Set<string>();
        const lines: string[] = [];
        for (const p of params) {
          if (p.value == null || seen.has(p.seriesName)) continue;
          seen.add(p.seriesName);
          lines.push(`${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}`);
        }
        return header + lines.join('<br/>');
      },
    },
    legend: baseLegend(legendNames),
    grid: baseGrid(),
    xAxis: baseCategoryXAxis(data.dates),
    yAxis: { ...baseValueYAxis(t.revenueAmountLabel), min: 0 },
    series,
  };
}


// ============================================================
// 4. 利润瀑布图
// ============================================================

/**
 * 生成利润瀑布图配置（从总收入逐步扣减至利润）
 * 类目使用完整名称，颜色语义统一
 */
export function buildWaterfallOption(data: WaterfallResponse | undefined | null): Record<string, unknown> {
  if (!data) {
    return { title: { text: getCurrentLocaleLabels().noData, left: 'center', top: 'center', textStyle: { color: COLORS.textSecondary } } };
  }

  const t = getCurrentLocaleLabels();
  const categories = [t.totalRevenue, t.serverCostForecast, t.traffic4GCostForecast, t.cardFeeCostForecast, t.paymentFeeForecast, t.meariShareCostForecast, t.customerShareCostForecast, t.profitForecastKPI];
  const costs = [data.serverCost, data.trafficCost4G, data.cardFeeCost, data.paymentFee, data.meariShareCost, data.customerShareCost];

  const transparent: number[] = [];
  const values: number[] = [];
  const colors: string[] = [];

  transparent.push(0);
  values.push(data.totalRevenue);
  colors.push(COLORS.revenue);

  let running = data.totalRevenue;
  costs.forEach((cost) => {
    running -= cost;
    transparent.push(running);
    values.push(cost);
    colors.push(COLORS.cost);
  });

  transparent.push(0);
  values.push(data.profit);
  colors.push(data.profit >= 0 ? COLORS.profit : '#f85149');

  return {
    tooltip: {
      ...baseTooltip(),
      trigger: 'axis',
      formatter(params: Array<{ seriesName: string; value: number; marker: string; dataIndex: number }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const visible = params.filter((p) => p.seriesName !== '_transparent_base');
        if (visible.length === 0) return '';
        const idx = visible[0].dataIndex;
        const name = categories[idx];
        const val = values[idx];
        const pct = data.totalRevenue !== 0
          ? ((val / data.totalRevenue) * 100).toFixed(1)
          : '0.0';
        return `<div style="font-weight:bold">${name}</div>${formatCurrency(val)}<br/>${t.revenueSharePct}: ${pct}%`;
      },
    },
    grid: baseGrid(),
    xAxis: {
      ...baseCategoryXAxis(categories),
      axisLabel: { color: COLORS.textSecondary, fontSize: 12, rotate: 20 },
    },
    yAxis: { ...baseValueYAxis(t.amountLabel), min: 0 },
    series: [
      {
        name: '_transparent_base',
        type: 'bar',
        stack: 'waterfall',
        data: transparent.map(v => ({
          value: v,
          itemStyle: { color: 'transparent' },
          emphasis: { itemStyle: { color: 'transparent' } },
        })),
        tooltip: { show: false },
      },
      {
        name: '_values',
        type: 'bar',
        stack: 'waterfall',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: { color: colors[i] },
        })),
        label: {
          show: true,
          position: 'top',
          color: COLORS.textPrimary,
          formatter: (p: { value: number }) => formatLargeNumber(p.value),
        },
      },
    ],
  };
}


// ============================================================
// 5. 套餐盈利排行横向条形图
// ============================================================

/**
 * 生成套餐盈利排行横向条形图配置（降序排列，排名第一高亮，末端数据标签）
 */
export function buildPackageRankingOption(
  items: PackageRankingItem[] | undefined | null,
  metric: 'profit' | 'profitMargin' | 'revenue' | 'cost' = 'profit',
): Record<string, unknown> {
  if (!items || items.length === 0) {
    return { title: { text: getCurrentLocaleLabels().noData, left: 'center', top: 'center', textStyle: { color: COLORS.textSecondary } } };
  }

  const t = getCurrentLocaleLabels();

  const sorted = [...items].sort((a, b) => b[metric] - a[metric]);
  const names = sorted.map((item) => item.name).reverse();
  const values = sorted.map((item) => item[metric]).reverse();

  const metricLabels: Record<string, string> = {
    profit: t.profitAmount,
    profitMargin: t.profitMargin,
    revenue: t.revenueMetric,
    cost: t.costMetric,
  };

  const metricColors: Record<string, string> = {
    profit: COLORS.profit,
    profitMargin: COLORS.profitMargin,
    revenue: COLORS.revenue,
    cost: COLORS.cost,
  };

  const baseColor = metricColors[metric];
  const topIndex = values.length - 1;

  return {
    tooltip: {
      ...baseTooltip(),
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params: Array<{ name: string; value: number; marker: string }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const name = params[0].name;
        const item = sorted.find((s) => s.name === name);
        if (!item) return '';
        return [
          `<div style="font-weight:bold">${name}</div>`,
          `${t.profitAmount}: ${formatCurrency(item.profit)}`,
          `${t.profitMargin}: ${formatPercent(item.profitMargin)}`,
          `${t.revenueMetric}: ${formatCurrency(item.revenue)}`,
          `${t.costMetric}: ${formatCurrency(item.cost)}`,
        ].join('<br/>');
      },
    },
    grid: { ...baseGrid(), left: '15%' },
    xAxis: {
      type: 'value',
      name: metricLabels[metric],
      nameTextStyle: { color: COLORS.textSecondary },
      axisLabel: {
        color: COLORS.textSecondary,
        formatter: metric === 'profitMargin'
          ? (v: number) => formatPercent(v)
          : (v: number) => formatLargeNumber(v),
      },
      splitLine: { lineStyle: { color: COLORS.borderColor, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: COLORS.textSecondary },
      axisLine: { lineStyle: { color: COLORS.borderColor } },
    },
    series: [
      {
        name: metricLabels[metric],
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: i === topIndex
            ? { color: baseColor, borderColor: '#fff', borderWidth: 2 }
            : { color: baseColor },
        })),
        label: {
          show: true,
          position: 'right',
          color: COLORS.textPrimary,
          fontSize: 12,
          formatter: metric === 'profitMargin'
            ? (p: { value: number }) => formatPercent(p.value)
            : (p: { value: number }) => formatLargeNumber(p.value),
        },
      },
    ],
  };
}


// ============================================================
// 6. 成本专项分析折线图
// ============================================================

/**
 * 生成成本专项分析折线图配置
 * 支持历史/预测双段展示
 * @param dateRanges 周/月粒度下每个数据点对应的实际统计周期范围
 */
export function buildCostDetailOption(data: CostDetailResponse | undefined | null, dateRanges?: string[]): Record<string, unknown> {
  if (!data || !data.dates?.length) {
    return { title: { text: getCurrentLocaleLabels().noData, left: 'center', top: 'center', textStyle: { color: COLORS.textSecondary } } };
  }

  const fsi = data.forecastStartIndex;
  const hasForecast = fsi != null && fsi > 0 && fsi < data.dates.length;

  const t = getCurrentLocaleLabels();
  const seriesDefs = [
    { name: t.paymentFeeForecast, values: data.paymentFee, color: COLORS.paymentFee },
    { name: t.traffic4GCostForecast, values: data.trafficCost4G, color: COLORS.trafficCost4G },
    { name: t.cardFeeCostForecast, values: data.cardFeeCost, color: COLORS.cardFeeCost },
    { name: t.meariShareCostForecast, values: data.meariShareCost, color: COLORS.meariShare },
    { name: t.customerShareCostForecast, values: data.customerShareCost, color: COLORS.customerShare },
  ];

  const legendNames = seriesDefs.map((s) => s.name);
  const series: Record<string, unknown>[] = [];

  for (let si = 0; si < seriesDefs.length; si++) {
    const def = seriesDefs[si];
    if (hasForecast) {
      const { history, forecast } = splitHistoryForecast(def.values, fsi!);
      const historySeries: Record<string, unknown> = {
        name: def.name,
        type: 'line',
        data: history,
        itemStyle: { color: def.color },
        lineStyle: { color: def.color, type: 'solid' },
        smooth: true,
      };
      if (si === 0) {
        historySeries.markLine = forecastMarkLine(data.dates, fsi!);
      }
      series.push(historySeries);
      series.push({
        name: def.name,
        type: 'line',
        data: forecast,
        itemStyle: { color: def.color },
        lineStyle: { color: def.color, type: 'dashed' },
        smooth: true,
      });
    } else {
      series.push({
        name: def.name,
        type: 'line',
        data: def.values,
        itemStyle: { color: def.color },
        lineStyle: { color: def.color },
        smooth: true,
      });
    }
  }

  return {
    tooltip: {
      ...baseTooltip(),
      formatter(params: Array<{ seriesName: string; value: number | null; marker: string; dataIndex: number }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const idx = params[0].dataIndex;
        const rangeText = dateRanges?.[idx];
        const headerLabel = rangeText ?? (params as Array<{ axisValue?: string }>)[0]?.axisValue ?? '';
        const header = `<div style="margin-bottom:4px;font-weight:bold">${headerLabel}</div>`;
        const seen = new Set<string>();
        const lines: string[] = [];
        for (const p of params) {
          if (p.value == null || seen.has(p.seriesName)) continue;
          seen.add(p.seriesName);
          lines.push(`${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}`);
        }
        return header + lines.join('<br/>');
      },
    },
    legend: baseLegend(legendNames),
    grid: baseGrid(),
    xAxis: baseCategoryXAxis(data.dates),
    yAxis: { ...baseValueYAxis(t.costAmountLabel), min: 0 },
    series,
  };
}


// ============================================================
// 7. 收入预测分析看板2（跨期确认 vs 当月新增）
// ============================================================

/**
 * 生成收入预测分析看板2 ECharts 配置
 * 3 条折线：跨期可确认收入预测（虚线紫）、当月新增可确认收入预测（实线金）、总可确认收入预测（实线加粗蓝）
 * 支持历史/预测双段展示
 * @param dateRanges 周/月粒度下每个数据点对应的实际统计周期范围
 */
export function buildRevenueForecastV2Option(
  data: RevenueForecastV2Response | undefined | null,
  dateRanges?: string[],
): Record<string, unknown> {
  if (!data || !data.dates?.length) {
    return { title: { text: getCurrentLocaleLabels().noData, left: 'center', top: 'center', textStyle: { color: COLORS.textSecondary } } };
  }

  const fsi = data.forecastStartIndex;
  const hasForecast = fsi != null && fsi > 0 && fsi < data.dates.length;

  const t = getCurrentLocaleLabels();

  // 注意：跨期收入本身就是虚线，预测段用更稀疏的虚线区分
  const seriesDefs = [
    { name: t.crossPeriodRevenue, values: data.crossPeriodRevenue, color: '#d2a8ff', historyLineType: 'dashed' as const, forecastLineType: [4, 4] as number[], lineWidth: 1 },
    { name: t.currentMonthRevenue, values: data.newMonthRevenue, color: '#e6c07b', historyLineType: 'solid' as const, forecastLineType: 'dashed' as const, lineWidth: 1 },
    { name: t.totalRevenue, values: data.totalConfirmedRevenue, color: '#58a6ff', historyLineType: 'solid' as const, forecastLineType: 'dashed' as const, lineWidth: 3 },
  ];

  const legendNames = seriesDefs.map((s) => s.name);
  const series: Record<string, unknown>[] = [];

  for (let si = 0; si < seriesDefs.length; si++) {
    const def = seriesDefs[si];
    if (hasForecast) {
      const { history, forecast } = splitHistoryForecast(def.values, fsi!);
      const historySeries: Record<string, unknown> = {
        name: def.name,
        type: 'line',
        data: history,
        itemStyle: { color: def.color },
        lineStyle: { color: def.color, type: def.historyLineType, width: def.lineWidth },
        smooth: true,
      };
      if (si === 0) {
        historySeries.markLine = forecastMarkLine(data.dates, fsi!);
      }
      series.push(historySeries);
      series.push({
        name: def.name,
        type: 'line',
        data: forecast,
        itemStyle: { color: def.color },
        lineStyle: { color: def.color, type: def.forecastLineType, width: def.lineWidth },
        smooth: true,
      });
    } else {
      series.push({
        name: def.name,
        type: 'line',
        data: def.values,
        itemStyle: { color: def.color },
        lineStyle: { color: def.color, type: def.historyLineType, width: def.lineWidth },
        smooth: true,
      });
    }
  }

  return {
    tooltip: {
      ...baseTooltip(),
      formatter(params: Array<{ seriesName: string; value: number | null; marker: string; dataIndex: number }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const idx = params[0].dataIndex;
        const rangeText = dateRanges?.[idx];
        const headerLabel = rangeText ?? (params as Array<{ axisValue?: string }>)[0]?.axisValue ?? '';
        const header = `<div style="margin-bottom:4px;font-weight:bold">${headerLabel}</div>`;
        const seen = new Set<string>();
        const lines: string[] = [];
        for (const p of params) {
          if (p.value == null || seen.has(p.seriesName)) continue;
          seen.add(p.seriesName);
          lines.push(`${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}`);
        }
        return header + lines.join('<br/>');
      },
    },
    legend: baseLegend(legendNames),
    grid: baseGrid(),
    xAxis: baseCategoryXAxis(data.dates),
    yAxis: { ...baseValueYAxis(t.amountLabel), min: 0 },
    series,
  };
}

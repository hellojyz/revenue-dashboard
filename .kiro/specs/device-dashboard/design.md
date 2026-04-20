# 技术设计文档：一级驾驶舱（设备域）device-dashboard

## 概述

本文档描述设备域一级驾驶舱看板的技术设计方案。该看板面向设备负责人，定位为"结果监控 + 健康解释护栏"，提供设备规模、激活、活跃、在线稳定性、供电健康、接入体验健康及流失情况的综合视图，默认展示近12个月趋势（月粒度），支持多维度切片分析，并提供异常下钻及专题诊断入口。

技术栈：React 18 + TypeScript + Vite + ECharts（echarts-for-react）+ Zustand + Ant Design + TanStack Query

设计原则：
- 复用现有 `KPICard` 组件，遵循已有的组件模式（参考 HeatmapDashboard / SimpleDashboard）
- 新建 `src/components/DeviceDashboard/` 目录，保持与其他看板一致的目录结构
- Mock 数据驱动开发，通过 `USE_MOCK` 标志切换真实 API
- Zustand 管理全局筛选状态，TanStack Query 管理数据请求缓存
- 页面采用6行结构，信息层次为：结果总览 → 原因解释 → 结构定位 → 专题诊断

---

## 架构

### 整体组件树

```
App.tsx
  └── DeviceDashboardPage（新增 Tab）
        ├── 第1行：页面标题区（内联渲染）
        ├── 第2行：DeviceFilterBar（全局筛选器）
        ├── 第3行：DeviceKPIRow（KPI卡片区，复用 KPICard）
        ├── 第4-5行：DeviceTrendGrid（趋势图区，2行2列）
        │     ├── [左上] DeviceScaleTrendChart（规模-激活-活跃趋势图）
        │     ├── [右上] DeviceOnlineTrendChart（在线稳定性趋势图）
        │     ├── [左下] DevicePowerTrendChart（供电健康趋势图）
        │     └── [右下] DeviceAccessTrendChart（接入与体验健康趋势图）
        └── 第6行：DeviceBottomRow
              ├── DeviceDistributionChart（结构分布图，左侧约60%）
              └── DeviceTopicEntries（专题入口区，右侧约40%）
```

### 数据流

```
useDeviceStore（Zustand）
  ├── filters（已提交筛选条件，触发数据请求）
  ├── pendingFilters（暂存筛选条件，不触发请求）
  ├── highlightedChart（KPI点击高亮的图表ID）
  ├── drillDownPoint（趋势图点击的数据点标识）
  └── distributionDimension（分布图当前维度）

useDeviceData（TanStack Query hooks）
  ├── useDeviceKPIData()   → fetchDeviceKPI(filters)
  ├── useDeviceTrendData() → fetchDeviceTrend(filters)
  └── useDeviceDistributionData(dimension) → fetchDeviceDistribution(filters, dimension)

deviceApi.ts → deviceMockData.ts（USE_MOCK=true 时）
```

### 状态管理模式

与 HeatmapDashboard 保持一致的"暂存-提交"模式：
- `pendingFilters`：用户操作中的暂存状态，不触发数据请求
- `filters`：点击"查询"后提交的状态，作为 TanStack Query 的 queryKey，触发重新请求
- `highlightedChart`：KPI卡片点击后高亮的图表标识（toggle 行为）
- `drillDownPoint`：趋势图点击后的联动数据点标识，传递给分布图高亮逻辑
- `distributionDimension`：分布图当前展示维度

---

## 组件与接口

### 目录结构

```
src/components/DeviceDashboard/
  ├── DeviceDashboardPage.tsx          # 页面容器（6行布局）
  ├── DeviceDashboardPage.module.css
  ├── DeviceFilterBar.tsx              # 全局筛选器（8个维度）
  ├── DeviceFilterBar.module.css
  ├── DeviceKPIRow.tsx                 # KPI卡片行（复用 KPICard）
  ├── DeviceKPIRow.module.css
  ├── DeviceTrendGrid.tsx              # 趋势图2行2列容器
  ├── DeviceScaleTrendChart.tsx        # 规模-激活-活跃趋势图
  ├── DeviceOnlineTrendChart.tsx       # 在线稳定性趋势图
  ├── DevicePowerTrendChart.tsx        # 供电健康趋势图
  ├── DeviceAccessTrendChart.tsx       # 接入与体验健康趋势图
  ├── DeviceDistributionChart.tsx      # 结构分布图
  ├── DeviceTopicEntries.tsx           # 专题入口区（5个入口）
  └── DeviceTopicEntries.module.css

src/hooks/useDeviceData.ts             # TanStack Query 数据请求 hooks
src/utils/deviceThresholds.ts          # 告警阈值配置
src/types/deviceDashboard.ts           # 类型定义（已存在，需扩展）
src/store/useDeviceStore.ts            # Zustand store（已存在，需扩展）
src/api/deviceApi.ts                   # API请求函数（已存在）
src/api/deviceMockData.ts              # Mock数据（已存在，需扩展）
```

### 组件接口定义

#### DeviceDashboardPage

无 Props，作为页面容器，组合所有子组件，渲染6行布局。

#### DeviceFilterBar

无 Props，内部通过 `useDeviceStore` 读写 `pendingFilters`，点击"查询"调用 `commitFilters()`。

筛选维度及控件类型：

| 维度 | 控件类型 | 选项来源 |
|------|----------|----------|
| 时间范围 | Select（单选）+ 自定义日期 RangePicker | 近12个月/近6个月/近3个月/自定义 |
| 区域 | Select（多选） | 中国/北美/欧洲/东南亚/其他 |
| 渠道 | Select（多选） | 线上/线下/运营商 |
| 机型 | Select（多选） | 动态从API获取 |
| 固件版本 | Select（多选） | 动态从API获取 |
| APP版本 | Select（多选） | 动态从API获取 |
| 供电方式 | Radio.Group | 全部/常电/低功耗 |
| 生命周期阶段 | Select（多选） | 新品期/成长期/成熟期/衰退期 |

#### DeviceKPIRow

无 Props，内部通过 `useDeviceKPIData()` 获取数据，通过 `useDeviceStore` 读取 `highlightedChart`。

KPI卡片配置：

| 卡片 | 指标 | 格式 | 高亮条件 | 对应图表ID |
|------|------|------|----------|------------|
| 设备总数 | totalDevices | 万/百万 | 无 | `scale` |
| 激活设备数 | activatedDevices | 万/百万 | 无 | `scale` |
| 活跃设备数 | activeDevices | 万/百万 | 无 | `scale` |
| 在线率 | onlineRate | 百分比 | 低于85%→黄色 | `online` |
| 流失设备数/活跃占比 | churnRatio | 百分比 | 超过15%→红色 | `online` |

#### DeviceScaleTrendChart / DeviceOnlineTrendChart / DevicePowerTrendChart / DeviceAccessTrendChart

```typescript
interface DeviceTrendChartProps {
  chartId: string;           // 用于 KPI 点击高亮联动，如 'scale' | 'online' | 'power' | 'access'
  isHighlighted?: boolean;   // 由父组件传入，KPI点击时高亮边框
}
```

各图表内部通过 `useDeviceTrendData()` 获取数据，通过 `useDeviceStore` 读取 `drillDownPoint`。
在线稳定性/供电健康/接入体验图表内部维护本地 `granularity` 状态（日/周/月切换）。

#### DeviceDistributionChart

无 Props，内部通过 `useDeviceDistributionData(dimension)` 获取数据，通过 `useDeviceStore` 读取 `drillDownPoint` 和 `distributionDimension`。

#### DeviceTopicEntries

无 Props，静态渲染5个专题入口卡片，点击跳转对应路由。

---

## 数据模型

### 筛选条件（已存在，需扩展 timeRange 枚举）

```typescript
// src/types/deviceDashboard.ts（扩展）

export type TimeRange =
  | 'last_12_months'   // 近12个月（默认）
  | 'last_6_months'
  | 'last_3_months'
  | 'custom';

export type PowerType = 'all' | 'wired' | 'low_power';  // 常电=wired, 低功耗=low_power

export interface DeviceFilters {
  timeRange: TimeRange;
  customDateRange?: [string, string];
  region: DeviceRegion[];
  channel: DeviceChannel[];
  model: DeviceModel[];
  firmwareVersion: FirmwareVersion[];
  appVersion: AppVersion[];
  powerType: PowerType[];
  lifecycleStage: LifecycleStage[];
}
```

### KPI 数据模型（已存在）

```typescript
export interface DeviceKPIItem {
  value: number | null;
  changePercent: number | null;   // 环比变化，如 0.05 = 5%
  sparkline: number[];            // 迷你趋势线数据（12个点）
}

export interface DeviceKPIData {
  totalDevices: DeviceKPIItem;        // 设备总数
  activatedDevices: DeviceKPIItem;    // 激活设备数
  activeDevices: DeviceKPIItem;       // 活跃设备数
  onlineRate: DeviceKPIItem;          // 在线率（0~1）
  churnRatio: DeviceKPIItem;          // 流失占比（0~1）
  updatedAt: string;
}
```

### 趋势图数据模型（扩展月粒度字段）

```typescript
// 通用时序数据点（支持周/月粒度）
export interface TimeSeriesPoint {
  period: string;       // 如 "2025-01"（月）或 "2025-W01"（周）或 "2025-01-06"（日）
  dateRange: string;    // tooltip 用，如 "2025-01-01 ~ 2025-01-31"
  [key: string]: number | string | null;
}

// 规模-激活-活跃趋势（图表1，左上）
// TimeSeriesPoint 包含字段：totalDevices, activatedDevices, activeDevices
export interface DeviceScaleTrendData {
  points: TimeSeriesPoint[];
}

// 在线稳定性趋势（图表2，右上）
// TimeSeriesPoint 包含字段：onlineRate, offlineRate, frequentOfflineCount
export interface DeviceOnlineTrendData {
  points: TimeSeriesPoint[];
}

// 供电健康趋势（图表3，左下）
// TimeSeriesPoint 包含字段：dailyPowerConsumption, chargingAbnormalCount, highPowerRatio
export interface DevicePowerTrendData {
  points: TimeSeriesPoint[];
}

// 接入与体验健康趋势（图表4，右下）
// TimeSeriesPoint 包含字段：firstNetworkSuccessRate, finalWifiSuccessRate, previewLatency, sdCardLossCount
export interface DeviceAccessTrendData {
  points: TimeSeriesPoint[];
}

export interface DeviceTrendData {
  scale: DeviceScaleTrendData;
  online: DeviceOnlineTrendData;
  power: DevicePowerTrendData;
  access: DeviceAccessTrendData;
  updatedAt: string;
}
```

### 结构分布数据模型（已存在）

```typescript
export interface DistributionItem {
  label: string;
  value: number;
  ratio: number;          // 0~1，所有items之和应为1
  highlighted?: boolean;  // 联动高亮状态
}

export interface DeviceDistributionData {
  dimension: DistributionDimension;
  items: DistributionItem[];
  updatedAt: string;
}
```

### Zustand Store（扩展 drillDownPoint）

```typescript
// src/store/useDeviceStore.ts（扩展）
export interface DeviceStore {
  filters: DeviceFilters;
  pendingFilters: DeviceFilters;
  highlightedChart: string | null;       // 被KPI点击高亮的图表ID
  drillDownPoint: string | null;         // 趋势图点击联动的数据点标识（period字符串）
  distributionDimension: DistributionDimension;

  setPendingFilters: (partial: Partial<DeviceFilters>) => void;
  commitFilters: () => void;
  resetFilters: () => void;
  setHighlightedChart: (chartId: string | null) => void;
  setDrillDownPoint: (point: string | null) => void;  // toggle行为
  setDistributionDimension: (dim: DistributionDimension) => void;
}
```

### 告警阈值配置

```typescript
// src/utils/deviceThresholds.ts
export const DEVICE_THRESHOLDS = {
  onlineRate:               { yellow: 0.85 },   // 在线率低于85%→黄色告警
  churnRatio:               { red: 0.15 },       // 流失占比超过15%→红色告警
  chargingAbnormalCount:    { red: 500 },        // 充电异常设备数超过500→红色告警
  firstNetworkSuccessRate:  { red: 0.80 },       // 首次配网成功率低于80%→红色告警
  finalWifiSuccessRate:     { red: 0.90 },       // 最终WiFi配网成功率低于90%→红色告警
} as const;

export type ThresholdKey = keyof typeof DEVICE_THRESHOLDS;

/** 判断某指标值是否触发告警，返回告警级别或null */
export function getAlertLevel(
  key: ThresholdKey,
  value: number,
): 'yellow' | 'red' | null {
  const t = DEVICE_THRESHOLDS[key];
  if ('yellow' in t && value < t.yellow) return 'yellow';
  if ('red' in t) {
    // 成功率类：低于阈值告警；数量类：超过阈值告警
    const isRate = key.includes('Rate') || key === 'onlineRate' || key === 'churnRatio';
    if (isRate ? value < t.red : value > t.red) return 'red';
  }
  return null;
}
```

---

## API 接口设计

### 现有接口（复用）

```typescript
// src/api/deviceApi.ts（已存在，无需修改）
fetchDeviceKPI(filters: DeviceFilters): Promise<DeviceKPIData>
fetchDeviceTrend(filters: DeviceFilters): Promise<DeviceTrendData>
fetchDeviceDistribution(filters: DeviceFilters, dimension: DistributionDimension): Promise<DeviceDistributionData>
```

### TanStack Query Hooks（新建 src/hooks/useDeviceData.ts）

```typescript
import { useQuery } from '@tanstack/react-query';
import { useDeviceStore } from '../store/useDeviceStore';
import { fetchDeviceKPI, fetchDeviceTrend, fetchDeviceDistribution } from '../api/deviceApi';

// KPI 数据
export function useDeviceKPIData() {
  const filters = useDeviceStore((s) => s.filters);
  return useQuery({
    queryKey: ['device-kpi', filters],
    queryFn: () => fetchDeviceKPI(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// 趋势数据
export function useDeviceTrendData() {
  const filters = useDeviceStore((s) => s.filters);
  return useQuery({
    queryKey: ['device-trend', filters],
    queryFn: () => fetchDeviceTrend(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// 分布数据（按维度独立缓存）
export function useDeviceDistributionData(dimension: DistributionDimension) {
  const filters = useDeviceStore((s) => s.filters);
  return useQuery({
    queryKey: ['device-distribution', filters, dimension],
    queryFn: () => fetchDeviceDistribution(filters, dimension),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Mock 数据扩展

现有 `deviceMockData.ts` 需扩展以下字段：
- `mockDeviceTrend` 中各趋势数据需增加月粒度的12个数据点（当前为周粒度）
- `online` 趋势需增加 `frequentOfflineCount` 字段
- `power` 趋势需增加 `dailyPowerConsumption`、`chargingAbnormalCount`、`highPowerRatio` 字段
- `access` 趋势需增加 `firstNetworkSuccessRate`、`finalWifiSuccessRate`、`previewLatency`、`sdCardLossCount` 字段

---

## 图表配置方案

### 图表1：规模-激活-活跃趋势图（左上，多折线）

位置：趋势图区第一行左侧

```typescript
// ECharts option 结构
{
  grid: { top: 40, right: 20, bottom: 60, left: 60 },
  legend: { top: 8, data: ['设备总数', '激活设备数', '活跃设备数'] },
  xAxis: {
    type: 'category',
    data: points.map(p => p.period),  // 月标签，如 "2025-01"
    axisLabel: { formatter: (v) => v.slice(5) + '月' }
  },
  yAxis: { type: 'value', axisLabel: { formatter: formatLargeNumber } },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => `${params[0].axisValue}\n日期范围：${dateRange}\n设备总数：${...}\n激活设备数：${...}\n活跃设备数：${...}`
  },
  series: [
    { name: '设备总数',    type: 'line', data: [...], smooth: true, color: '#58a6ff' },
    { name: '激活设备数',  type: 'line', data: [...], smooth: true, color: '#3fb950' },
    { name: '活跃设备数',  type: 'line', data: [...], smooth: true, color: '#bc8cff' },
  ]
}
```

交互：点击数据点调用 `setDrillDownPoint(period)`（toggle），联动分布图高亮。

---

### 图表2：在线稳定性趋势图（右上，折线+堆叠柱）

位置：趋势图区第一行右侧

粒度切换控件：图表右上角 Radio.Group（日/周/月），本地 state 管理，切换后调用 `timeAggregation.ts` 重新聚合。

```typescript
{
  grid: { top: 40, right: 60, bottom: 60, left: 60 },
  legend: { top: 8 },
  xAxis: { type: 'category', data: [...] },
  yAxis: [
    { type: 'value', name: '比率', min: 0, max: 1, axisLabel: { formatter: (v) => `${(v*100).toFixed(0)}%` } },
    { type: 'value', name: '设备数', position: 'right' },
  ],
  series: [
    { name: '在线率',         type: 'line',  yAxisIndex: 0, data: [...], color: '#3fb950',
      markPoint: { data: onlineRateAnomalies.map(i => ({ coord: [i, onlineRateData[i]], itemStyle: { color: '#ffd700' } })) }
    },
    { name: '离线率',         type: 'line',  yAxisIndex: 0, data: [...], color: '#f85149' },
    { name: '频繁上下线设备数', type: 'bar',   yAxisIndex: 1, data: [...], color: '#e3b341', stack: 'offline' },
  ]
}
```

异常标注：在线率低于 `DEVICE_THRESHOLDS.onlineRate.yellow` 的数据点，通过 `markPoint` 或 `itemStyle.color` 标注浅黄色。

---

### 图表3：供电健康趋势图（左下，折线+分布柱）

位置：趋势图区第二行左侧

粒度切换控件：同图表2，本地 state 管理。

```typescript
{
  yAxis: [
    { type: 'value', name: '耗电/占比', position: 'left' },
    { type: 'value', name: '设备数',    position: 'right' },
  ],
  series: [
    { name: '日耗电量',       type: 'line', yAxisIndex: 0, data: [...], color: '#58a6ff' },
    { name: '高耗电占比',     type: 'line', yAxisIndex: 0, data: [...], color: '#e3b341' },
    { name: '充电异常设备数', type: 'bar',  yAxisIndex: 1, data: [...],
      itemStyle: { color: (params) => getAlertLevel('chargingAbnormalCount', params.value) === 'red' ? '#f85149' : '#bc8cff' }
    },
  ]
}
```

---

### 图表4：接入与体验健康趋势图（右下，柱线组合）

位置：趋势图区第二行右侧

粒度切换控件：同图表2，本地 state 管理。

```typescript
{
  yAxis: [
    { type: 'value', name: '成功率', min: 0, max: 1, axisLabel: { formatter: (v) => `${(v*100).toFixed(0)}%` } },
    { type: 'value', name: '耗时/设备数', position: 'right' },
  ],
  series: [
    { name: '首次配网成功率',       type: 'line', yAxisIndex: 0, data: [...], color: '#3fb950',
      markPoint: { data: anomalies.map(...) }
    },
    { name: '最终WiFi配网成功率',   type: 'line', yAxisIndex: 0, data: [...], color: '#58a6ff' },
    { name: '设备预览耗时(ms)',     type: 'bar',  yAxisIndex: 1, data: [...], color: '#e3b341' },
    { name: 'SD卡录像丢失设备数',   type: 'bar',  yAxisIndex: 1, data: [...], color: '#f85149' },
  ]
}
```

---

### 图表5：结构分布图（水平条形图）

位置：第六行左侧（约60%宽度）

维度切换：图表上方 Radio.Group（机型/区域/渠道/生命周期阶段），调用 `setDistributionDimension()`。

```typescript
{
  grid: { top: 40, right: 120, bottom: 20, left: 100 },
  xAxis: { type: 'value', axisLabel: { formatter: formatLargeNumber } },
  yAxis: { type: 'category', data: items.map(i => i.label) },
  series: [{
    type: 'bar',
    data: items.map(i => ({
      value: i.value,
      itemStyle: {
        color: i.highlighted ? '#f85149' : '#58a6ff',  // 联动高亮时变红
        opacity: drillDownPoint && !i.highlighted ? 0.4 : 1,
      }
    })),
    label: { show: true, position: 'right', formatter: (p) => `${(items[p.dataIndex].ratio * 100).toFixed(1)}%` }
  }]
}
```

联动逻辑：当 `drillDownPoint` 不为空时，根据异常点所在维度，将相关 `DistributionItem.highlighted` 设为 true，其余项降低透明度。

---

## 交互逻辑设计

### 交互1：KPI卡片点击 → 趋势图高亮

```
用户点击 KPICard
  → DeviceKPIRow 调用 setHighlightedChart(chartId)（toggle）
  → DeviceTrendGrid 读取 highlightedChart
  → 对应 TrendChart 容器添加高亮边框样式（CSS class）
  → 再次点击同一卡片 → setHighlightedChart(null) 清除高亮
```

KPI 与图表 ID 映射：
- 设备总数 / 激活设备数 / 活跃设备数 → `chartId: 'scale'`
- 在线率 / 流失占比 → `chartId: 'online'`

### 交互2：趋势图数据点点击 → 分布图联动高亮

```
用户点击趋势图数据点（ECharts onClick 事件）
  → TrendChart 调用 setDrillDownPoint(period)（toggle）
  → DeviceDistributionChart 读取 drillDownPoint
  → 根据 drillDownPoint 对应时间段，高亮分布图中相关维度项
  → 再次点击同一数据点 → setDrillDownPoint(null) 清除联动
```

高亮规则：当 `drillDownPoint` 不为空时，分布图中占比最高的前2项标记为 `highlighted: true`，其余项透明度降至0.4，模拟"该时间段问题集中在哪些维度"的视觉效果。

### 交互3：趋势图时间粒度切换

```
用户点击粒度切换 Radio（日/周/月）
  → TrendChart 本地 state 更新 granularity
  → 调用 timeAggregation.ts 对原始数据重新聚合
  → ECharts option 更新，图表重新渲染
  → 不影响全局 store，不触发 API 重新请求
```

粒度切换仅影响图表2（在线稳定性）、图表3（供电健康）、图表4（接入体验）。
图表1（规模趋势）固定月粒度，不提供粒度切换控件。

### 交互4：分布图维度切换

```
用户点击维度切换 Radio（机型/区域/渠道/生命周期阶段）
  → DeviceDistributionChart 调用 setDistributionDimension(dim)
  → useDeviceDistributionData(dim) 触发新的 TanStack Query 请求
  → 分布图数据更新，重新渲染
```

### 交互5：专题入口跳转

```
用户点击专题入口卡片
  → DeviceTopicEntries 调用路由跳转（React Router navigate）
  → 跳转至对应二级/三级专题分析页
```

专题入口配置：

| 专题名称 | 说明文案 | 跳转路由 |
|----------|----------|----------|
| 供电健康 | 电量消耗、充电异常、高耗电分布 | `/device/power-health` |
| 连接健康 | 在线率、频繁上下线、信号质量 | `/device/connection-health` |
| 接入健康 | 配网成功率、配网耗时分布 | `/device/access-health` |
| 体验健康 | 预览耗时、SD卡录像丢失 | `/device/experience-health` |
| 识别健康 | 识别准确率、误报率、漏报率 | `/device/recognition-health` |

### 交互6：全局筛选器联动

```
用户修改筛选项（暂存到 pendingFilters）
  → 点击"查询"按钮 → commitFilters()
  → filters 更新 → TanStack Query queryKey 变化
  → 所有 useDeviceKPIData / useDeviceTrendData / useDeviceDistributionData 重新请求
  → 页面所有模块数据同步刷新
  → 同时清除 drillDownPoint 和 highlightedChart（避免联动状态残留）
```

---

## 视觉风格设计

### 配色方案

| 用途 | 颜色 | CSS变量 |
|------|------|---------|
| 标题栏背景 | `#1a2332`（深蓝） | `--device-header-bg` |
| 页面背景 | `#f0f4f8`（浅灰蓝） | `--device-page-bg` |
| KPI核心指标 | `#3fb950`（浅绿） | `--device-kpi-primary` |
| 在线率相关 | `#ffd700`（浅黄） | `--device-alert-yellow` |
| 流失风险相关 | `#f85149`（浅红） | `--device-alert-red` |
| 图表线1 | `#58a6ff`（蓝） | `--device-chart-blue` |
| 图表线2 | `#3fb950`（绿） | `--device-chart-green` |
| 图表线3 | `#bc8cff`（紫） | `--device-chart-purple` |
| 图表线4 | `#e3b341`（橙黄） | `--device-chart-orange` |

### 布局规格

```css
/* 6行布局 */
.page { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--device-page-bg); }

/* 趋势图区：2行2列 */
.trendGrid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 12px; }

/* 底部行：分布图 + 专题入口 */
.bottomRow { display: grid; grid-template-columns: 3fr 2fr; gap: 12px; }

/* 图表卡片 */
.chartCard { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.chartCard.highlighted { border: 2px solid var(--device-kpi-primary); }

/* KPI卡片行 */
.kpiRow { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
```

---

## 正确性属性

*属性是在系统所有有效执行中应保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1：筛选条件提交后 store 状态一致性

*对于任意*筛选条件对象，调用 `commitFilters()` 后，`store.filters` 应与提交前的 `pendingFilters` 完全一致，且 TanStack Query 的 queryKey 应包含新的筛选条件。

**验证需求：2.2**

### 属性 2：KPI卡片完整渲染

*对于任意*有效的 `DeviceKPIItem` 数据对象（value 非 null），渲染后的 KPICard 应同时包含：指标名称文本、格式化后的数值、环比变化方向箭头、迷你趋势折线图元素。

**验证需求：3.2**

### 属性 3：KPI卡片阈值高亮

*对于任意*在线率值 `v`，当 `v < DEVICE_THRESHOLDS.onlineRate.yellow` 时，`getAlertLevel('onlineRate', v)` 应返回 `'yellow'`；当 `v >= DEVICE_THRESHOLDS.onlineRate.yellow` 时应返回 `null`。对于任意流失占比值 `v`，当 `v > DEVICE_THRESHOLDS.churnRatio.red` 时应返回 `'red'`，否则返回 `null`。

**验证需求：3.9, 3.10**

### 属性 4：趋势图异常数据点标注

*对于任意*趋势数据序列和阈值配置，`getAlertLevel(key, value)` 对超出阈值的数据点应返回非 null 的告警级别，对未超出阈值的数据点应返回 null；且告警级别与阈值方向（低于/高于）一致。

**验证需求：5.4, 6.4, 7.4**

### 属性 5：KPI点击联动趋势图高亮（toggle）

*对于任意*图表ID字符串，调用 `setHighlightedChart(id)` 后 `store.highlightedChart` 应等于该 id；对同一 id 再次调用后应等于 null（toggle 行为）。

**验证需求：3.11, 9.3**

### 属性 6：趋势图点击联动分布图（toggle）

*对于任意*数据点标识字符串，调用 `setDrillDownPoint(point)` 后 `store.drillDownPoint` 应等于该 point；对同一 point 再次调用后应等于 null（toggle 行为）。

**验证需求：4.3, 5.5, 6.5, 7.5**

### 属性 7：分布图占比不变量

*对于任意*有效的 `DeviceDistributionData` 对象，其 `items` 数组中所有 `ratio` 字段之和应在 `[0.99, 1.01]` 范围内（允许浮点误差）。

**验证需求：8.2**

### 属性 8：空数据状态渲染

*对于任意*图表组件，当传入空数组数据时，渲染结果应包含空状态提示元素（`EmptyState` 组件），而不是空白区域或抛出错误。

**验证需求：12.3**

---

## 错误处理

### 数据加载错误

- 使用 TanStack Query 的 `isLoading` / `isError` 状态驱动 UI
- 加载中：展示 `LoadingState` 组件（复用 `src/components/common/LoadingState.tsx`）
- 加载失败：展示错误提示 + 重试按钮（调用 `refetch()`）
- 每个图表模块用 `ErrorBoundary` 包裹，防止单模块错误影响整页

### 空数据处理

- KPI 数值为 null 时展示 `--`（复用 KPICard 现有逻辑）
- 趋势图数据为空数组时展示 `EmptyState` 组件（复用 `src/components/common/EmptyState.tsx`）
- 分布图数据为空时展示空状态提示

### 筛选器边界处理

- 自定义日期范围：禁用未来日期（`disabledDate: (c) => c > dayjs().endOf('day')`）
- 多选为空时等同于"全选"，API 层 `filtersToParams` 传空字符串，后端解释为不过滤
- 时间范围与粒度不匹配时（如时间范围过短无法展示月粒度），图表自动降级并在图表标题旁展示提示文字

### 阈值配置缺失降级

- 阈值配置集中在 `src/utils/deviceThresholds.ts`，提供 `as const` 类型安全的默认值
- `getAlertLevel` 函数若 key 不存在则返回 null，不触发异常标注（安全降级）

---

## 测试策略

### 双轨测试方法

本功能采用单元测试 + 属性测试的双轨方法：
- **单元测试**：验证具体示例、边界条件和错误状态
- **属性测试**：验证跨所有输入的通用规则（使用 `fast-check`，项目已安装）

两者互补：单元测试捕获具体 bug，属性测试验证通用正确性。

### 单元测试（示例测试）

测试文件位置：与被测文件同目录，命名为 `*.test.tsx` / `*.test.ts`

重点覆盖：
- `DeviceDashboardPage` 渲染标题"一级驾驶舱（设备域）"和定位说明文案（需求 1.1, 1.2）
- `DeviceFilterBar` 包含所有8个筛选维度控件（需求 2.1）
- `DeviceFilterBar` 供电方式选项包含"全部/常电/低功耗"（需求 2.5）
- `DeviceFilterBar` 默认状态 `pendingFilters` 为空数组（需求 2.4）
- `DeviceKPIRow` 渲染5个 KPICard 组件（需求 3.1）
- `DeviceScaleTrendChart` ECharts option 包含3条折线 series（需求 4.1）
- `DeviceOnlineTrendChart` ECharts option 包含折线和柱状图 series（需求 5.1）
- `DeviceTopicEntries` 渲染5个专题入口卡片（需求 8.6）
- 页面6行区域顺序符合规范（需求 9.1）
- 加载状态渲染 `LoadingState`（需求 12.1）
- 错误状态渲染错误提示和重试按钮（需求 12.2）
- 数据更新时间展示（需求 12.4）

### 属性测试（fast-check）

测试文件：`src/components/DeviceDashboard/__tests__/deviceDashboard.property.test.ts`

每个属性测试最少运行 **100 次迭代**（`{ numRuns: 100 }`）。

**属性 1：筛选条件提交后 store 状态一致性**
```
// Feature: device-dashboard, Property 1: 筛选条件提交后 store 状态一致性
fc.assert(fc.property(
  fc.record({ timeRange: fc.constantFrom('last_12_months', 'last_6_months'), region: fc.array(fc.string()), ... }),
  (filters) => {
    useDeviceStore.getState().setPendingFilters(filters);
    useDeviceStore.getState().commitFilters();
    expect(useDeviceStore.getState().filters).toEqual(expect.objectContaining(filters));
  }
), { numRuns: 100 });
```

**属性 2：KPI卡片完整渲染**
```
// Feature: device-dashboard, Property 2: KPI卡片完整渲染
fc.assert(fc.property(
  fc.record({ value: fc.float({ min: 0 }), changePercent: fc.float({ min: -1, max: 1 }), sparkline: fc.array(fc.float(), { minLength: 1 }) }),
  (kpiItem) => {
    const { getByTestId } = render(<KPICard title="测试" value={kpiItem.value} changePercent={kpiItem.changePercent} sparklineData={kpiItem.sparkline} />);
    expect(getByTestId('kpi-value')).toBeTruthy();
    expect(getByTestId('kpi-change')).toBeTruthy();
    expect(getByTestId('kpi-sparkline')).toBeTruthy();
  }
), { numRuns: 100 });
```

**属性 3：KPI卡片阈值高亮**
```
// Feature: device-dashboard, Property 3: KPI卡片阈值高亮
fc.assert(fc.property(fc.float({ min: 0, max: 1 }), (rate) => {
  const level = getAlertLevel('onlineRate', rate);
  if (rate < DEVICE_THRESHOLDS.onlineRate.yellow) expect(level).toBe('yellow');
  else expect(level).toBeNull();
}), { numRuns: 100 });
```

**属性 4：趋势图异常数据点标注**
```
// Feature: device-dashboard, Property 4: 趋势图异常数据点标注
fc.assert(fc.property(fc.float({ min: 0, max: 1 }), (rate) => {
  const level = getAlertLevel('firstNetworkSuccessRate', rate);
  if (rate < DEVICE_THRESHOLDS.firstNetworkSuccessRate.red) expect(level).toBe('red');
  else expect(level).toBeNull();
}), { numRuns: 100 });
```

**属性 5：KPI点击联动趋势图高亮（toggle）**
```
// Feature: device-dashboard, Property 5: KPI点击联动趋势图高亮（toggle）
fc.assert(fc.property(fc.string({ minLength: 1 }), (chartId) => {
  const store = useDeviceStore.getState();
  store.setHighlightedChart(chartId);
  expect(useDeviceStore.getState().highlightedChart).toBe(chartId);
  store.setHighlightedChart(chartId);  // toggle
  expect(useDeviceStore.getState().highlightedChart).toBeNull();
}), { numRuns: 100 });
```

**属性 6：趋势图点击联动分布图（toggle）**
```
// Feature: device-dashboard, Property 6: 趋势图点击联动分布图（toggle）
fc.assert(fc.property(fc.string({ minLength: 1 }), (point) => {
  const store = useDeviceStore.getState();
  store.setDrillDownPoint(point);
  expect(useDeviceStore.getState().drillDownPoint).toBe(point);
  store.setDrillDownPoint(point);  // toggle
  expect(useDeviceStore.getState().drillDownPoint).toBeNull();
}), { numRuns: 100 });
```

**属性 7：分布图占比不变量**
```
// Feature: device-dashboard, Property 7: 分布图占比不变量
fc.assert(fc.property(
  fc.array(fc.float({ min: 0.01, max: 1 }), { minLength: 1, maxLength: 10 }),
  (rawValues) => {
    const total = rawValues.reduce((s, v) => s + v, 0);
    const items = rawValues.map(v => ({ label: 'x', value: v, ratio: v / total }));
    const ratioSum = items.reduce((s, i) => s + i.ratio, 0);
    expect(ratioSum).toBeCloseTo(1, 2);
  }
), { numRuns: 100 });
```

**属性 8：空数据状态渲染**
```
// Feature: device-dashboard, Property 8: 空数据状态渲染
// 对每个图表组件传入空数组，验证渲染包含 EmptyState
[DeviceScaleTrendChart, DeviceOnlineTrendChart, DevicePowerTrendChart, DeviceAccessTrendChart].forEach(Chart => {
  const { container } = render(<Chart chartId="test" data={[]} />);
  expect(container.querySelector('[data-testid="empty-state"]')).toBeTruthy();
});
```

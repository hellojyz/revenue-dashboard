# 实现任务列表：一级驾驶舱（设备域）

## 概述

基于 React 18 + TypeScript + ECharts + Zustand + TanStack Query 技术栈，按"基础层 → 数据层 → 组件层 → 集成层 → 测试层"顺序实现设备域一级驾驶舱看板。

## 任务

- [ ] 1. 基础层：类型定义扩展
  - [ ] 1.1 扩展 `src/types/deviceDashboard.ts`
    - 将 `timeRange` 字段类型改为 `'last_12_months' | 'last_6_months' | 'last_3_months' | 'custom'`（当前为 string）
    - 将 `PowerType` 改为 `'all' | 'wired' | 'low_power'`（对齐需求 2.5：常电/低功耗）
    - 将趋势数据结构从 `WeeklyDataPoint / weeks` 重命名为 `TimeSeriesPoint / points`，新增 `period`、`dateRange` 字段
    - 扩展 `DeviceScaleTrendData.points` 字段：`totalDevices, activatedDevices, activeDevices`
    - 扩展 `DeviceOnlineTrendData.points` 字段：`onlineRate, offlineRate, frequentOfflineCount`
    - 扩展 `DevicePowerTrendData.points` 字段：`dailyPowerConsumption, chargingAbnormalCount, highPowerRatio`
    - 扩展 `DeviceAccessTrendData.points` 字段：`firstNetworkSuccessRate, finalWifiSuccessRate, previewLatency, sdCardLossCount`
    - _需求：2.5, 4.1, 5.1, 6.1, 7.1_

- [ ] 2. 基础层：Zustand Store 扩展
  - [ ] 2.1 扩展 `src/store/useDeviceStore.ts`
    - 将 `drillDownWeek` 重命名为 `drillDownPoint`，类型保持 `string | null`
    - 将 `setDrillDownWeek` 重命名为 `setDrillDownPoint`，保持 toggle 行为（再次调用同值时置 null）
    - 将 `DEFAULT_FILTERS.timeRange` 改为 `'last_12_months'`
    - 在 `commitFilters()` 中同时清除 `drillDownPoint` 和 `highlightedChart`（避免联动状态残留）
    - _需求：2.2, 9.3, 9.4_

- [ ] 3. 基础层：告警阈值工具
  - [ ] 3.1 新建 `src/utils/deviceThresholds.ts`
    - 定义 `DEVICE_THRESHOLDS` 常量（`as const`）：`onlineRate.yellow=0.85`、`churnRatio.red=0.15`、`chargingAbnormalCount.red=500`、`firstNetworkSuccessRate.red=0.80`、`finalWifiSuccessRate.red=0.90`
    - 实现 `getAlertLevel(key, value): 'yellow' | 'red' | null`，成功率类低于阈值告警，数量类超过阈值告警，key 不存在时返回 null
    - _需求：3.9, 3.10, 5.4, 6.4, 7.4_

- [ ] 4. 基础层：Mock 数据扩展
  - [ ] 4.1 重构 `src/api/deviceMockData.ts`
    - 将周粒度数据结构（`WeeklyDataPoint / weeks`）迁移为月粒度（`TimeSeriesPoint / points`），生成近12个月数据点，`period` 格式为 `"2025-01"`，`dateRange` 为 `"2025-01-01 ~ 2025-01-31"`
    - 为 `online` 趋势补充 `frequentOfflineCount` 字段（基准值约 1200，随机波动）
    - 为 `power` 趋势补充 `dailyPowerConsumption`（基准 3.2 度）、`chargingAbnormalCount`（基准 320，偶发超 500 触发告警）、`highPowerRatio`（基准 0.12）字段
    - 为 `access` 趋势补充 `firstNetworkSuccessRate`（基准 0.83）、`finalWifiSuccessRate`（基准 0.92）、`previewLatency`（基准 1800ms）、`sdCardLossCount`（基准 85）字段
    - _需求：4.2, 5.1, 6.1, 7.1_

- [ ] 5. 数据层：TanStack Query Hooks
  - [ ] 5.1 新建 `src/hooks/useDeviceData.ts`
    - 实现 `useDeviceKPIData()`：queryKey `['device-kpi', filters]`，staleTime 5 分钟
    - 实现 `useDeviceTrendData()`：queryKey `['device-trend', filters]`，staleTime 5 分钟
    - 实现 `useDeviceDistributionData(dimension)`：queryKey `['device-distribution', filters, dimension]`，staleTime 5 分钟
    - 每个 hook 均从 `useDeviceStore` 读取 `filters`
    - _需求：2.2, 8.5, 12.1, 12.2_

- [ ] 6. 组件层：DeviceFilterBar
  - [ ] 6.1 新建 `src/components/DeviceDashboard/DeviceFilterBar.tsx`
    - 使用本地 state 暂存筛选项，点击"查询"调用 `setPendingFilters` + `commitFilters()`，点击"重置"调用 `resetFilters()`
    - 时间范围：Select 单选（近12个月/近6个月/近3个月/自定义），选"自定义"时显示 RangePicker，禁用未来日期
    - 区域：Select 多选（中国/北美/欧洲/东南亚/其他）
    - 渠道：Select 多选（线上/线下/运营商）
    - 机型/固件版本/APP版本：Select 多选（静态占位选项，预留动态加载接口）
    - 供电方式：Radio.Group（全部/常电/低功耗），对应值 `'all' | 'wired' | 'low_power'`
    - 生命周期阶段：Select 多选（新品期/成长期/成熟期/衰退期）
    - _需求：2.1, 2.3, 2.4, 2.5_
  - [ ] 6.2 新建 `src/components/DeviceDashboard/DeviceFilterBar.module.css`
    - 参考 `HeatmapFilterBar.module.css` 样式结构，横向排列筛选项，右侧放查询/重置按钮
    - _需求：2.1_

- [ ] 7. 组件层：DeviceKPIRow
  - [ ] 7.1 新建 `src/components/DeviceDashboard/DeviceKPIRow.tsx`
    - 调用 `useDeviceKPIData()` 获取数据，加载中展示 LoadingState，失败展示错误提示
    - 复用 `KPICard` 组件渲染5个卡片：设备总数、激活设备数、活跃设备数、在线率、流失占比
    - 设备总数/激活/活跃数值使用 `formatLargeNumber` 格式化（万/百万）
    - 在线率/流失占比使用 `formatPercent` 格式化
    - 调用 `getAlertLevel('onlineRate', value)` 判断在线率是否需要黄色高亮，调用 `getAlertLevel('churnRatio', value)` 判断流失占比是否需要红色高亮，通过 `highlighted` prop 或自定义 className 传递给 KPICard
    - 每个卡片点击时调用 `setHighlightedChart(chartId)`（toggle），chartId 映射：设备总数/激活/活跃 → `'scale'`，在线率/流失占比 → `'online'`
    - _需求：3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_
  - [ ] 7.2 新建 `src/components/DeviceDashboard/DeviceKPIRow.module.css`
    - 5列等宽网格布局，参考 `KPICardRow.module.css`
    - _需求：3.1_

- [ ] 8. 组件层：DeviceScaleTrendChart（规模-激活-活跃趋势图）
  - [ ] 8.1 新建 `src/components/DeviceDashboard/DeviceScaleTrendChart.tsx`
    - Props：`{ chartId: string; isHighlighted?: boolean }`
    - 调用 `useDeviceTrendData()` 获取 `data.scale.points`，数据为空时渲染 `EmptyState`
    - ECharts option：3条折线（设备总数蓝色/激活设备数绿色/活跃设备数紫色），xAxis 月标签格式化为 `"01月"`，yAxis 使用 `formatLargeNumber`，tooltip 显示 `dateRange` 和三项数值
    - 图表固定月粒度，不提供粒度切换控件
    - ECharts `onClick` 事件调用 `setDrillDownPoint(period)`（toggle）
    - `isHighlighted` 为 true 时容器添加高亮边框 CSS class
    - _需求：4.1, 4.2, 4.3, 4.4, 9.2_

- [ ] 9. 组件层：DeviceOnlineTrendChart（在线稳定性趋势图）
  - [ ] 9.1 新建 `src/components/DeviceDashboard/DeviceOnlineTrendChart.tsx`
    - Props：`{ chartId: string; isHighlighted?: boolean }`
    - 调用 `useDeviceTrendData()` 获取 `data.online.points`，数据为空时渲染 `EmptyState`
    - 本地 state `granularity: 'day' | 'week' | 'month'`（默认 `'month'`），图表右上角 Radio.Group 切换，切换后调用 `timeAggregation.ts` 重新聚合数据
    - ECharts option：双 yAxis（左轴比率 0~1，右轴设备数），在线率折线（绿色）+ 离线率折线（红色）+ 频繁上下线设备数柱（橙黄色）
    - 在线率低于 `DEVICE_THRESHOLDS.onlineRate.yellow` 的数据点通过 `markPoint` 标注浅黄色
    - ECharts `onClick` 调用 `setDrillDownPoint(period)`（toggle）
    - `isHighlighted` 为 true 时容器添加高亮边框
    - _需求：5.1, 5.2, 5.3, 5.4, 5.5, 9.2, 10.2, 10.3_

- [ ] 10. 组件层：DevicePowerTrendChart（供电健康趋势图）
  - [ ] 10.1 新建 `src/components/DeviceDashboard/DevicePowerTrendChart.tsx`
    - Props：`{ chartId: string; isHighlighted?: boolean }`
    - 调用 `useDeviceTrendData()` 获取 `data.power.points`，数据为空时渲染 `EmptyState`
    - 本地 state `granularity`，图表右上角 Radio.Group 切换（日/周/月）
    - ECharts option：双 yAxis（左轴耗电/占比，右轴设备数），日耗电量折线（蓝色）+ 高耗电占比折线（橙黄色）+ 充电异常设备数柱（超阈值时红色，否则紫色，通过 `itemStyle.color` 回调实现）
    - ECharts `onClick` 调用 `setDrillDownPoint(period)`（toggle）
    - `isHighlighted` 为 true 时容器添加高亮边框
    - _需求：6.1, 6.2, 6.3, 6.4, 6.5, 9.2, 10.2, 10.3_

- [ ] 11. 组件层：DeviceAccessTrendChart（接入与体验健康趋势图）
  - [ ] 11.1 新建 `src/components/DeviceDashboard/DeviceAccessTrendChart.tsx`
    - Props：`{ chartId: string; isHighlighted?: boolean }`
    - 调用 `useDeviceTrendData()` 获取 `data.access.points`，数据为空时渲染 `EmptyState`
    - 本地 state `granularity`，图表右上角 Radio.Group 切换（日/周/月）
    - ECharts option：双 yAxis（左轴成功率 0~1，右轴耗时/设备数），首次配网成功率折线（绿色）+ 最终WiFi配网成功率折线（蓝色）+ 设备预览耗时柱（橙黄色）+ SD卡录像丢失设备数柱（红色）
    - 配网成功率低于对应阈值的数据点通过 `markPoint` 标注浅红色
    - ECharts `onClick` 调用 `setDrillDownPoint(period)`（toggle）
    - `isHighlighted` 为 true 时容器添加高亮边框
    - _需求：7.1, 7.2, 7.3, 7.4, 7.5, 9.2, 10.2, 10.3_

- [ ] 12. 组件层：DeviceTrendGrid（趋势图容器）
  - [ ] 12.1 新建 `src/components/DeviceDashboard/DeviceTrendGrid.tsx`
    - 从 `useDeviceStore` 读取 `highlightedChart`
    - 以 2行2列 CSS Grid 布局组合4个趋势图：左上 `DeviceScaleTrendChart`（chartId=`'scale'`）、右上 `DeviceOnlineTrendChart`（chartId=`'online'`）、左下 `DevicePowerTrendChart`（chartId=`'power'`）、右下 `DeviceAccessTrendChart`（chartId=`'access'`）
    - 将 `isHighlighted={highlightedChart === chartId}` 传入各图表
    - 每个图表用 `ErrorBoundary` 包裹
    - _需求：9.1, 9.2, 9.3_

- [ ] 13. 组件层：DeviceDistributionChart（结构分布图）
  - [ ] 13.1 新建 `src/components/DeviceDashboard/DeviceDistributionChart.tsx`
    - 从 `useDeviceStore` 读取 `distributionDimension` 和 `drillDownPoint`
    - 图表上方 Radio.Group 切换维度（机型/区域/渠道/生命周期阶段），调用 `setDistributionDimension()`
    - 调用 `useDeviceDistributionData(dimension)` 获取数据，数据为空时渲染 `EmptyState`
    - ECharts option：水平条形图，xAxis 使用 `formatLargeNumber`，yAxis 为分类轴，label 显示百分比
    - 当 `drillDownPoint` 不为空时，占比最高的前2项 `highlighted=true`（红色），其余项透明度 0.4；`drillDownPoint` 为空时所有项正常显示
    - _需求：8.2, 8.3, 8.4, 8.5_

- [ ] 14. 组件层：DeviceTopicEntries（专题入口区）
  - [ ] 14.1 新建 `src/components/DeviceDashboard/DeviceTopicEntries.tsx`
    - 静态渲染5个专题入口卡片：供电健康（`/device/power-health`）、连接健康（`/device/connection-health`）、接入健康（`/device/access-health`）、体验健康（`/device/experience-health`）、识别健康（`/device/recognition-health`）
    - 每个卡片展示专题名称和简要说明文案
    - 点击卡片使用 `window.location.href` 或 React Router `navigate` 跳转（当前项目无 React Router 时用 `window.location.href` 占位）
    - _需求：8.6, 8.7, 8.8_
  - [ ] 14.2 新建 `src/components/DeviceDashboard/DeviceTopicEntries.module.css`
    - 垂直排列5个入口卡片，每个卡片含标题和说明文案，hover 时高亮边框
    - _需求：8.6_

- [ ] 15. 组件层：DeviceDashboardPage（页面容器）
  - [ ] 15.1 新建 `src/components/DeviceDashboard/DeviceDashboardPage.tsx`
    - 调用 `useDeviceKPIData()` 获取 `updatedAt`，格式化后展示数据更新时间
    - 6行布局：① 页面标题"一级驾驶舱（设备域）"+ 定位说明文案"结果监控 + 健康解释护栏" ② `DeviceFilterBar` ③ `DeviceKPIRow` ④⑤ `DeviceTrendGrid` ⑥ 底部行（`DeviceDistributionChart` 左侧约60% + `DeviceTopicEntries` 右侧约40%）
    - 顶层加载状态：`useDeviceKPIData().isLoading` 为 true 时展示 `LoadingState`
    - 顶层错误状态：`isError` 为 true 时展示错误提示 + 重试按钮（调用 `refetch()`）
    - 各子模块用 `ErrorBoundary` 包裹，防止单模块错误影响整页
    - _需求：1.1, 1.2, 1.3, 9.1, 11.1, 11.2, 11.4, 12.1, 12.2, 12.4_
  - [ ] 15.2 新建 `src/components/DeviceDashboard/DeviceDashboardPage.module.css`
    - 定义 CSS 变量：`--device-header-bg: #1a2332`、`--device-page-bg: #f0f4f8`、`--device-kpi-primary: #3fb950`、`--device-alert-yellow: #ffd700`、`--device-alert-red: #f85149`
    - 6行 flex column 布局，gap 12px，padding 16px，背景 `var(--device-page-bg)`
    - 底部行：`grid-template-columns: 3fr 2fr`
    - _需求：11.2, 11.4_

- [ ] 16. 集成：注册 Tab 入口
  - [ ] 16.1 修改 `src/App.tsx`，新增"设备域看板"Tab
    - 在 `tabItems` 数组中追加 `{ key: 'device', label: '设备域看板', children: <DeviceDashboardPage /> }`
    - 导入 `DeviceDashboardPage` 组件
    - _需求：1.1_

- [ ] 17. 检查点：确保基础功能可运行
  - 确保所有新增文件无 TypeScript 编译错误
  - 确保 App.tsx 中设备域看板 Tab 可正常切换并渲染页面标题
  - 确保 KPI 卡片、趋势图、分布图均能展示 Mock 数据
  - 如有问题，请向用户说明并等待确认后继续

- [ ] 18. 测试：告警阈值工具单元测试
  - [ ] 18.1 新建 `src/utils/deviceThresholds.test.ts`
    - 测试 `getAlertLevel('onlineRate', 0.84)` 返回 `'yellow'`（需求 3.9）
    - 测试 `getAlertLevel('onlineRate', 0.85)` 返回 `null`（需求 3.9）
    - 测试 `getAlertLevel('churnRatio', 0.16)` 返回 `'red'`（需求 3.10）
    - 测试 `getAlertLevel('churnRatio', 0.15)` 返回 `null`（需求 3.10）
    - 测试 `getAlertLevel('chargingAbnormalCount', 501)` 返回 `'red'`（需求 6.4）
    - 测试 `getAlertLevel('firstNetworkSuccessRate', 0.79)` 返回 `'red'`（需求 7.4）
    - 测试不存在的 key 时函数安全降级返回 `null`
    - _需求：3.9, 3.10, 6.4, 7.4_
  - [ ]* 18.2 为 `getAlertLevel` 编写属性测试（Property 3）
    - **Property 3：KPI卡片阈值高亮**
    - **验证需求：3.9, 3.10**
    - 使用 `fc.float({ min: 0, max: 1 })` 生成任意在线率值，验证 `v < 0.85` 时返回 `'yellow'`，否则返回 `null`
    - 使用 `fc.float({ min: 0, max: 1 })` 生成任意流失占比值，验证 `v > 0.15` 时返回 `'red'`，否则返回 `null`
    - 使用 `fc.float({ min: 0, max: 1 })` 生成任意配网成功率值，验证 `v < 0.80` 时返回 `'red'`（Property 4）
    - **验证需求：5.4, 6.4, 7.4**
    - `numRuns: 100`
  - [ ]* 18.3 为 `getAlertLevel` 编写属性测试（Property 4）
    - **Property 4：趋势图异常数据点标注**
    - **验证需求：5.4, 6.4, 7.4**
    - 使用 `fc.float({ min: 0, max: 1 })` 生成任意 `firstNetworkSuccessRate` 值，验证阈值方向正确
    - `numRuns: 100`

- [ ] 19. 测试：Zustand Store 单元测试与属性测试
  - [ ] 19.1 新建 `src/store/useDeviceStore.test.ts`
    - 测试 `commitFilters()` 后 `filters` 与提交前 `pendingFilters` 完全一致（需求 2.2）
    - 测试 `setHighlightedChart('scale')` 后值为 `'scale'`，再次调用后值为 `null`（toggle，需求 3.11）
    - 测试 `setDrillDownPoint('2025-01')` 后值为 `'2025-01'`，再次调用后值为 `null`（toggle，需求 4.3）
    - 测试 `commitFilters()` 同时清除 `drillDownPoint` 和 `highlightedChart`（需求 2.2）
    - _需求：2.2, 3.11, 4.3_
  - [ ]* 19.2 为 Store 编写属性测试（Property 1）
    - **Property 1：筛选条件提交后 store 状态一致性**
    - **验证需求：2.2**
    - 使用 `fc.record` 生成任意筛选条件，调用 `setPendingFilters` + `commitFilters`，验证 `filters` 与提交值一致
    - `numRuns: 100`
  - [ ]* 19.3 为 Store 编写属性测试（Property 5）
    - **Property 5：KPI点击联动趋势图高亮（toggle）**
    - **验证需求：3.11, 9.3**
    - 使用 `fc.string({ minLength: 1 })` 生成任意 chartId，验证 toggle 行为
    - `numRuns: 100`
  - [ ]* 19.4 为 Store 编写属性测试（Property 6）
    - **Property 6：趋势图点击联动分布图（toggle）**
    - **验证需求：4.3, 5.5, 6.5, 7.5**
    - 使用 `fc.string({ minLength: 1 })` 生成任意 drillDownPoint，验证 toggle 行为
    - `numRuns: 100`

- [ ] 20. 测试：组件单元测试
  - [ ] 20.1 新建 `src/components/DeviceDashboard/__tests__/DeviceDashboardPage.test.tsx`
    - 测试页面渲染标题"一级驾驶舱（设备域）"（需求 1.1）
    - 测试页面渲染定位说明文案含"结果监控"和"健康解释护栏"（需求 1.2）
    - 测试数据加载中时渲染 `LoadingState`（需求 12.1）
    - 测试数据加载失败时渲染错误提示和重试按钮（需求 12.2）
    - 测试页面6行区域按顺序渲染（需求 9.1）
    - _需求：1.1, 1.2, 9.1, 12.1, 12.2_
  - [ ] 20.2 新建 `src/components/DeviceDashboard/__tests__/DeviceFilterBar.test.tsx`
    - 测试包含8个筛选维度控件（需求 2.1）
    - 测试供电方式 Radio.Group 包含"全部/常电/低功耗"三个选项（需求 2.5）
    - 测试默认状态下 `pendingFilters` 各多选项为空数组（需求 2.4）
    - _需求：2.1, 2.4, 2.5_
  - [ ] 20.3 新建 `src/components/DeviceDashboard/__tests__/DeviceKPIRow.test.tsx`
    - 测试渲染5个 KPICard 组件（需求 3.1）
    - 测试在线率低于阈值时对应卡片有告警样式（需求 3.9）
    - 测试流失占比超过阈值时对应卡片有告警样式（需求 3.10）
    - _需求：3.1, 3.9, 3.10_
  - [ ] 20.4 新建 `src/components/DeviceDashboard/__tests__/DeviceTopicEntries.test.tsx`
    - 测试渲染5个专题入口卡片（需求 8.6）
    - 测试每个卡片包含专题名称和说明文案（需求 8.7）
    - _需求：8.6, 8.7_
  - [ ]* 20.5 为 KPICard 渲染编写属性测试（Property 2）
    - **Property 2：KPI卡片完整渲染**
    - **验证需求：3.2**
    - 使用 `fc.record` 生成任意有效 `DeviceKPIItem`（value 非 null），验证渲染后同时包含 `kpi-value`、`kpi-change`、`kpi-sparkline` 测试 ID
    - `numRuns: 100`
  - [ ]* 20.6 为分布图占比编写属性测试（Property 7）
    - **Property 7：分布图占比不变量**
    - **验证需求：8.2**
    - 使用 `fc.array(fc.float({ min: 0.01, max: 1 }), { minLength: 1, maxLength: 10 })` 生成任意原始值数组，归一化后验证 `ratio` 之和在 `[0.99, 1.01]` 范围内
    - `numRuns: 100`
  - [ ]* 20.7 为图表空数据状态编写属性测试（Property 8）
    - **Property 8：空数据状态渲染**
    - **验证需求：12.3**
    - 对 `DeviceScaleTrendChart`、`DeviceOnlineTrendChart`、`DevicePowerTrendChart`、`DeviceAccessTrendChart` 各传入空数组，验证渲染包含 `data-testid="empty-state"` 元素

- [ ] 21. 最终检查点：确保所有测试通过
  - 运行 `npm test` 确保所有测试通过
  - 确保 TypeScript 无编译错误
  - 确保设备域看板 Tab 在 App 中正常显示并可交互
  - 如有问题，请向用户说明并等待确认后继续

## 备注

- 标注 `*` 的子任务为可选测试任务，可在 MVP 阶段跳过
- 每个任务均引用具体需求条款，确保可追溯性
- 属性测试使用项目已安装的 `fast-check` 库，每个属性最少运行 100 次迭代
- 粒度切换（日/周/月）复用现有 `src/utils/timeAggregation.ts` 工具函数
- 所有图表组件用 `ErrorBoundary` 包裹，防止单模块错误影响整页

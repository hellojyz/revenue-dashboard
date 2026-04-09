# 实现计划：APP核心指标热力图看板

## 概述

基于设计文档，将APP核心指标热力图看板拆分为增量式编码任务。新功能创建独立的类型、store、API、组件和工具函数，复用现有通用组件（ErrorBoundary、EmptyState、LoadingState）和格式化工具（formatters）。所有代码使用 TypeScript + React 18 + Ant Design 5 + ECharts 5 + Zustand 5 + React Query 5 技术栈。

## Tasks

- [x] 1. 定义热力图看板类型与阈值配置
  - [x] 1.1 创建 `src/types/heatmap.ts`，定义 HeatmapFilters、HeatmapMetricKey、HeatmapAppMetric、HeatmapAlertItem、HeatmapHighlight、HeatmapSortConfig、HeatmapColorLevel、HeatmapThresholds、HeatmapDataResponse 等类型接口
    - 包含 DeviceType、PackageType、TimePeriod 枚举类型
    - HeatmapAppMetric 需包含 `yoyChange` 和 `momChange` 字段（Record<HeatmapMetricKey, number | null>），用于同比/环比波动型告警检测
    - _需求: 1.1, 3.1, 4.1, 8.1, 8.2, 8.3, 8.4, 8.5, 13.1_
  - [x] 1.2 创建 `src/utils/heatmapThresholds.ts`，定义 DEFAULT_HEATMAP_THRESHOLDS 常量和以下函数
    - 默认阈值：设备数黄线=5000/红线=2000，转化率黄线=0.2/红线=0.1，留存率黄线=0.5/红线=0.45，单设备收益黄线=20/红线=15
    - `getColorLevel` — 四级色阶映射（excellent/normal/warning/critical）
    - `getColorIntensity(value, metricKey, thresholds)` — 区间内深浅增强计算，返回 0~1 的相对位置值，不改变主风险类别
    - `evaluateAlerts` — 绝对阈值告警检测、分级和排序
    - `evaluateVolatilityAlerts(apps, thresholds)` — 波动型告警检测，基于 yoyChange/momChange 判断同比/环比异常，返回辅助提示列表
    - `getAttributionTemplate(metricKey)` — 按指标类型返回预定义归因方向集合（转化率→{新增设备占比变化, 高价值套餐渗透率变化, 付费设备数变化}，留存率→{到期设备数上升, 续费设备数下降, 某套餐流失异常}，单设备收益→{付费套餐结构下移, 高单价套餐渗透下降}，设备数→{某类型设备激活率下降, 某类型设备销量下降}）
    - `generateAttribution` — 基于归因模板实现，调用 getAttributionTemplate 获取归因方向，每条归因包含1至2个原因，无法识别时输出默认文案
    - `validateAppMetric` — 数据验证
    - `sortWithTieBreaking(data, sortConfig)` — 同值回退排序，回退优先级：设备数 > 单设备收益 > 转化率 > 留存率，以上仍相同则按APP名称排序
    - `handleNullValues(data, sortConfig)` — 空值处理，NULL 排末尾（无论升序或降序），0 视为有效数值正常排序
    - `computeDateRange(timePeriod, customRange?)` — 时间口径计算：近7天=含今天往前推6天，近30天=含今天往前推29天，自然月=当月1日至今天，自定义=闭区间
    - `formatMetricDisplay(value, metricKey)` — 指标展示格式化：设备数=整数，转化率/留存率=百分比，单设备收益=带单位「元」
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.9, 3.1, 3.2, 4.3, 4.4, 4.5, 4.6, 4.13, 5.3, 5.9, 5.10, 8.1, 8.2, 8.3, 8.4, 8.5, 11.7, 13.1, 13.2, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 1.7, 1.8, 1.9, 1.10_
  - [ ]* 1.3 编写 `src/utils/heatmapThresholds.test.ts` 属性测试
    - **Property 1: 告警分级一致性** — 随机生成指标值和阈值，验证分级结果与阈值关系
    - **验证: 需求 2.2, 2.3, 2.4**
    - **Property 2: 告警排序正确性** — 随机生成告警列表，验证排序后满足严重程度+偏离度降序
    - **验证: 需求 2.5**
    - **Property 3: 色阶映射一致性** — 随机生成数值，验证 getColorLevel 四级映射边界
    - **验证: 需求 4.3, 4.4, 4.5, 4.6**
    - **Property 4: 告警与色阶跨模块一致性** — 验证 evaluateAlerts 与 getColorLevel 对同一值的结果一致
    - **验证: 需求 5.7, 10.3**
    - **Property 8: 归因模板合规性** — 随机生成告警项和筛选条件，验证归因文案基于归因模板生成，归因方向属于该指标类型的预定义集合，每条归因包含1至2个原因
    - **验证: 需求 2.6, 2.9, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7**
    - **Property 9: 数据验证完整性** — 随机生成数据，验证 validateAppMetric 正确拒绝无效数据
    - **验证: 需求 8.1, 8.2, 8.3, 8.4, 8.5**
    - **Property 11: 表格排序与同值回退正确性** — 随机生成数据和排序列，验证 sortWithTieBreaking 排序后严格有序，同值按回退优先级排序，NULL排末尾
    - **验证: 需求 5.3, 5.9, 5.10**
    - **Property 13: 阈值层级约束** — 验证黄线严格大于红线
    - **验证: 需求 3.2**
    - **Property 14: 时间范围计算正确性** — 随机生成当前日期，验证 computeDateRange 对近7天/近30天/自然月/自定义的计算结果
    - **验证: 需求 1.7, 1.8, 1.9, 1.10**
    - **Property 15: 热力图区间内深浅变化** — 随机生成值和阈值，验证 getColorIntensity 返回 0~1 且不改变主风险类别
    - **验证: 需求 4.13**
    - **Property 16: 波动型告警优先级** — 验证 evaluateVolatilityAlerts 不替代绝对阈值告警等级，同时命中时以绝对阈值等级优先
    - **验证: 需求 13.1, 13.2, 13.3, 4.14**
    - **Property 17: 空值与零值处理** — 验证 handleNullValues 中 NULL 排末尾、0 正常参与排序
    - **验证: 需求 5.9, 5.10**
    - **Property 18: 导出数据正确性** — 验证导出当前筛选结果为全量数据，导出当前页为当前页码数据
    - **验证: 需求 5.6, 5.8**
    - **Property 19: 指标公式正确性** — 验证转化率=首次订阅增值数/激活数，留存率=在订设备数/历史订阅设备数，单设备收益=设备收益/活跃设备数
    - **验证: 需求 11.3, 11.4, 11.5**
    - **Property 20: 指标展示格式** — 验证 formatMetricDisplay 对各指标类型的格式化结果
    - **验证: 需求 11.7**
    - **Property 21: 数据更新时间格式** — 验证时间戳格式化为「数据更新时间：YYYY-MM-DD HH:mm」
    - **验证: 需求 12.2**

- [x] 2. 创建热力图看板 Store 和 API 层
  - [x] 2.1 创建 `src/store/useHeatmapStore.ts`，实现 HeatmapStore
    - 包含 filters/pendingFilters 双层筛选状态、highlight 联动高亮状态、sortConfig 排序配置
    - 实现 setPendingFilters、commitFilters、resetFilters、setHighlight、toggleHighlight、setSortConfig actions
    - toggleHighlight 实现点击同一元素取消高亮逻辑
    - _需求: 1.2, 1.3, 1.4, 2.8, 4.9, 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 2.2 编写 `src/store/useHeatmapStore.test.ts` 属性测试
    - **Property 5: 筛选状态管理正确性** — 验证 setPendingFilters/commitFilters/resetFilters 状态变更
    - **验证: 需求 1.2, 1.3, 1.4**
    - **Property 6: 联动高亮状态正确性** — 验证各种点击操作后高亮状态格式
    - **验证: 需求 2.8, 4.9, 6.1, 6.2, 6.3**
    - **Property 7: 联动高亮切换** — 验证再次点击同一元素清除高亮
    - **验证: 需求 6.4**
  - [ ] 2.3 创建 `src/api/heatmapApi.ts` 和 `src/api/heatmapMockData.ts`
    - heatmapMockData 提供 15~20 个 APP 的 mock 数据，每条数据需包含 `yoyChange` 和 `momChange` 字段（各指标的同比/环比变化值）
    - API 响应需包含 `updatedAt` 字段（数据更新时间戳）
    - heatmapApi 实现 fetchHeatmapData(filters) 函数，USE_MOCK 模式下返回 mock 数据
    - 复用现有 `src/api/client.ts`
    - _需求: 7.1, 7.3, 12.1, 12.3, 13.1_
  - [ ] 2.4 创建 `src/hooks/useHeatmapData.ts`，基于 React Query 封装数据请求 hook
    - filters 变化时自动 refetch
    - 返回值需包含 `updatedAt`（从 HeatmapDataResponse 中提取）
    - 配置 retry: 3 实现自动重试
    - _需求: 7.1, 7.2, 7.3, 12.1, 12.3_

- [ ] 3. 检查点 - 确保类型、Store、API 层编译通过
  - 确保所有测试通过，如有疑问请询问用户。

- [x] 4. 实现筛选栏组件
  - [ ] 4.1 创建 `src/components/HeatmapDashboard/HeatmapFilterBar.tsx` 和 `src/components/HeatmapDashboard/HeatmapFilterBar.module.css`
    - 使用 Ant Design Select 实现设备类型、套餐类型下拉选择
    - 使用 Ant Design Select + DatePicker.RangePicker 实现时间周期选择（自定义时显示日期范围选择器）
    - 时间口径计算需调用 `computeDateRange`：近7天=含今天往前推6天，近30天=含今天往前推29天，自然月=当月1日至今天，自定义=闭区间
    - 日期范围选择器禁止起始日期晚于结束日期
    - 实现「查询」和「重置」按钮
    - 筛选条件修改暂存于本地 state，查询时提交到 store
    - position: sticky 固定在页面顶部
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_
  - [ ]* 4.2 编写 `src/components/HeatmapDashboard/HeatmapFilterBar.test.tsx` 单元测试
    - **Property 12: 日期范围验证** — 验证起始日期晚于结束日期时被拒绝
    - **验证: 需求 1.5**
    - 测试查询按钮提交筛选条件、重置按钮恢复默认值
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 5. 实现告警模块组件
  - [ ] 5.1 创建 `src/components/HeatmapDashboard/HeatmapAlertMonitor.tsx` 和 `src/components/HeatmapDashboard/HeatmapAlertMonitor.module.css`
    - 接收 data 和 filters，调用 evaluateAlerts 生成绝对阈值告警列表
    - 同时调用 evaluateVolatilityAlerts 生成波动型告警辅助提示，波动型告警不替代绝对阈值等级，作为辅助信息展示
    - 告警项归因文案基于归因模板生成（调用 generateAttribution，内部使用 getAttributionTemplate）
    - 告警项展示归因文案，红色/黄色/绿色三色标记
    - 支持收起/展开（Ant Design Collapse 或自定义）
    - 点击告警项调用 store.toggleHighlight 触发联动
    - 联动高亮时对应告警项视觉突出
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 10.3, 13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  - [ ]* 5.2 编写 `src/components/HeatmapDashboard/HeatmapAlertMonitor.test.tsx` 单元测试
    - 测试告警列表渲染、排序、收起展开、点击联动
    - _需求: 2.1, 2.5, 2.7, 2.8_

- [ ] 6. 实现热力图组件
  - [ ] 6.1 创建 `src/components/HeatmapDashboard/HeatmapChart.tsx` 和 `src/components/HeatmapDashboard/HeatmapChart.module.css`
    - 使用 echarts-for-react 渲染热力图，Y轴=APP列表，X轴=4个固定指标
    - 单元格仅显示颜色（调用 getColorLevel 获取色阶），不显示数值
    - 实现区间内深浅增强：调用 getColorIntensity 获取区间内相对位置，在同一色阶区间内做轻微深浅变化，不改变主风险类别
    - 波动风险辅助提示：未触发绝对阈值但触发同比/环比波动异常的单元格，通过描边、角标或图标进行辅助提示，不改变主色阶颜色类别
    - tooltip 显示 APP名称、指标名称、当前值、色阶级别
    - 点击单元格调用 store.toggleHighlight 触发联动
    - 联动高亮时对应单元格边框加粗
    - Y轴支持排序切换（按APP名称或按指定指标值排序）
    - APP数量超出时Y轴支持垂直滚动，X轴固定
    - 使用 ErrorBoundary 包裹
    - _需求: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13, 4.14, 7.5, 13.2_
  - [ ]* 6.2 编写 `src/components/HeatmapDashboard/HeatmapChart.test.tsx` 单元测试
    - 测试热力图渲染、tooltip内容、点击联动、排序切换
    - _需求: 4.1, 4.8, 4.9, 4.11_

- [ ] 7. 实现明细表格组件
  - [x] 7.1 创建 `src/components/HeatmapDashboard/HeatmapDetailTable.tsx` 和 `src/components/HeatmapDashboard/HeatmapDetailTable.module.css`
    - 使用 Ant Design Table 展示 APP名称、设备数、转化率、留存率、单设备收益
    - 指标展示调用 formatMetricDisplay：设备数=整数，转化率/留存率=百分比，单设备收益=带单位「元」
    - 表头固定（sticky: true），支持点击列头排序
    - 排序调用 sortWithTieBreaking 实现同值回退排序（设备数 > 单设备收益 > 转化率 > 留存率，以上仍相同则按APP名称排序）
    - 空值处理调用 handleNullValues：NULL/无数据展示为「--」且排序时放置在末尾（无论升序或降序），0 视为有效数值正常参与排序和展示
    - 联动高亮时高亮对应行并自动 scrollIntoView
    - 分页：默认10条/页，可切换10/20/50
    - 排序后再分页（sortAndPaginate 逻辑）
    - 告警指标单元格显示风险标记颜色（与告警/热力图色阶一致）
    - 点击行调用 store.toggleHighlight({ appName })
    - 提供两个独立导出按钮：「导出当前筛选结果」导出当前筛选条件下的全量数据（不受分页限制），「导出当前页」仅导出当前页码数据，导出格式为Excel
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 6.3, 10.3, 11.7_
  - [ ]* 7.2 编写 `src/components/HeatmapDashboard/HeatmapDetailTable.test.tsx` 属性测试和单元测试
    - **Property 10: 分页完整性** — 随机生成数据和分页参数，验证所有页合并后等于原始数据
    - **验证: 需求 9.1, 9.2, 9.3**
    - **Property 11: 表格排序与同值回退正确性** — 随机生成数据和排序列，验证排序后严格有序，同值按回退优先级排序，NULL排末尾
    - **验证: 需求 5.3, 5.9, 5.10**
    - 测试联动高亮行、两个独立导出按钮功能
    - _需求: 5.1, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9, 5.10, 9.1, 9.2, 9.3_

- [ ] 8. 检查点 - 确保所有组件编译通过且测试通过
  - 确保所有测试通过，如有疑问请询问用户。

- [ ] 9. 组装页面并接入路由
  - [ ] 9.1 创建 `src/components/HeatmapDashboard/HeatmapDashboardPage.tsx` 和 `src/components/HeatmapDashboard/HeatmapDashboardPage.module.css`
    - 组装 HeatmapFilterBar、HeatmapAlertMonitor、HeatmapChart、HeatmapDetailTable 四大模块
    - 使用 useHeatmapStore 获取全局状态，使用 useHeatmapData 获取数据
    - 在页面显著位置展示数据更新时间（从 useHeatmapData 返回的 updatedAt 获取），格式为「数据更新时间：YYYY-MM-DD HH:mm」，数据刷新后同步更新
    - 数据加载中展示 LoadingState，请求失败展示 ErrorBoundary，无数据展示 EmptyState
    - 各模块间距 20px，白色背景、浅灰边框极简商务风
    - 各模块使用 ErrorBoundary 独立包裹，单模块崩溃不影响其他模块
    - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.4, 7.5, 10.1, 10.2, 10.3, 12.1, 12.2, 12.3_
  - [ ] 9.2 修改 `src/App.tsx`，添加热力图看板页面路由或入口
    - 可通过简单的页面切换（如 Tab 或路由）在现有看板和热力图看板之间切换
    - _需求: 无（集成任务）_

- [ ] 10. 最终检查点 - 确保全部功能集成完毕且测试通过
  - 确保所有测试通过，如有疑问请询问用户。

## 备注

- 标记 `*` 的子任务为可选测试任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点任务确保增量验证
- 属性测试使用 fast-check 库验证通用正确性属性
- 单元测试使用 Vitest + @testing-library/react 验证具体场景和边界情况

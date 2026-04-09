# 实施计划：可确认收入&利润经营看板

## 概述

基于 React 18 + TypeScript + Vite + ECharts + Zustand + React Query + Ant Design 技术栈，按增量方式构建可确认收入&利润经营看板。每个任务在前一任务基础上递进，确保无孤立代码。

## 任务

- [x] 1. 项目初始化与基础配置
  - [x] 1.1 初始化 Vite + React 18 + TypeScript 项目，安装核心依赖
    - 使用 Vite 创建 React + TypeScript 项目
    - 安装依赖：echarts、echarts-for-react、zustand、@tanstack/react-query、antd、axios
    - 安装开发依赖：vitest、@testing-library/react、@testing-library/jest-dom、jsdom、fast-check
    - 配置 vitest.config.ts（jsdom 环境、setup 文件）
    - 创建 `src/test/setup.ts` 测试初始化文件
    - _需求: 10.1_

  - [x] 1.2 创建深色驾驶舱主题 CSS 变量文件
    - 创建 `src/theme/variables.css`，定义深色/商务风格配色方案
    - 定义颜色变量：收入色（如蓝色系）、成本色（如橙色系）、利润色（如绿色系）、背景色、卡片背景色、文字色
    - 定义告警颜色：critical（红色）、warning（橙色）
    - 定义字号变量：KPI 突出字号、普通字号
    - 在 `src/main.tsx` 中引入主题文件
    - _需求: 10.4, 10.5_

- [x] 2. 类型定义与数据模型
  - [x] 2.1 创建 TypeScript 类型定义文件
    - 创建 `src/types/dashboard.ts`
    - 定义 `DashboardFilters` 接口（dateRange、timeGranularity、orderTypes、deviceTypes、productTypes、packageVersions）
    - 定义 API 响应类型：`KPIResponse`、`KPIMetric`、`TopPackageMetric`、`MainTrendResponse`、`CostStructureResponse`、`RevenueStructureResponse`、`WaterfallResponse`、`PackageRankingResponse`、`PackageRankingItem`、`CostDetailResponse`、`AlertResponse`、`AlertItem`
    - 定义 `AlertThresholds` 接口
    - 定义 `KPICardProps`、`AlertCardProps` 组件 Props 类型
    - _需求: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1_

- [x] 3. 全局状态管理（Zustand Store）
  - [x] 3.1 实现 Zustand 全局筛选与联动状态 Store
    - 创建 `src/store/useDashboardStore.ts`
    - 实现 `DashboardStore` 接口：filters、setFilters、resetFilters
    - 实现联动状态：drillDownDate、drillDownProduct、setDrillDownDate、setDrillDownProduct、clearDrillDown
    - 默认筛选条件：timeGranularity 为 'day'，所有多选项默认空数组（表示全部）
    - _需求: 1.2, 1.5, 11.1, 11.2_

  - [ ]* 3.2 编写属性测试：时间粒度互斥性
    - **Property 2: 时间粒度互斥性**
    - 使用 fast-check 生成任意时间粒度切换操作序列，验证 Store 中 timeGranularity 始终为 'day' | 'week' | 'month' 之一
    - **验证需求: 1.5**

  - [ ]* 3.3 编写属性测试：图表联动状态一致性
    - **Property 13: 图表联动状态一致性**
    - 使用 fast-check 生成任意点击操作序列，验证 drillDownDate/drillDownProduct 正确更新，再次点击同一项清除状态（toggle 行为）
    - **验证需求: 11.1, 11.2**

- [x] 4. API 层与数据获取 Hooks
  - [x] 4.1 创建 Axios 实例与 API 请求函数
    - 创建 `src/api/client.ts`：配置 Axios 实例（baseURL、超时、拦截器）
    - 创建 `src/api/dashboard.ts`：实现所有 API 请求函数（fetchKPI、fetchMainTrend、fetchCostStructure、fetchRevenueStructure、fetchWaterfall、fetchPackageRanking、fetchCostDetail、fetchAlerts）
    - 每个函数接收 DashboardFilters 参数，返回对应类型的 Promise
    - _需求: 1.3, 1.6_

  - [x] 4.2 创建 React Query 数据获取 Hooks
    - 创建 `src/hooks/useDashboardData.ts`
    - 实现 useKPIData、useMainTrendData、useCostStructureData、useRevenueStructureData、useWaterfallData、usePackageRankingData、useCostDetailData、useAlertData hooks
    - 每个 hook 从 Zustand Store 读取筛选条件作为 queryKey 的一部分，确保筛选变更触发重新请求
    - 配置 React Query 重试策略（3 次重试）
    - _需求: 1.3, 2.5, 3.6, 4.4, 5.5, 6.5, 7.7, 8.5_

  - [ ]* 4.3 编写属性测试：筛选条件变更触发数据重新请求
    - **Property 1: 筛选条件变更触发数据重新请求**
    - 使用 fast-check 生成任意筛选条件组合变更，验证 React Query 的 queryKey 包含更新后的筛选参数
    - **验证需求: 1.3, 1.6, 2.5, 3.6, 4.4, 5.5, 6.5, 7.7, 8.5**

- [x] 5. 工具函数层
  - [x] 5.1 实现数值格式化工具函数
    - 创建 `src/utils/formatters.ts`
    - 实现 formatCurrency（金额千分位 + 2 位小数，¥前缀）
    - 实现 formatPercent（1 位小数 + % 后缀）
    - 实现 formatChange（带正负号 + 1 位小数 + %）
    - 实现 formatLargeNumber（超万显示 x.xx万，超亿显示 x.xx亿）
    - 处理除零、NaN、null/undefined 等边界情况，返回 "--"
    - _需求: 2.2, 2.4, 3.5, 4.3, 6.3_

  - [x] 5.2 实现告警规则计算函数
    - 创建 `src/utils/alertRules.ts`
    - 实现 checkProfitMarginAlert：利润率低于阈值时生成告警
    - 实现 checkPaymentFeeAlert：手续费率环比上升超阈值时生成告警
    - 实现 checkTrafficCostAlert：单设备流量成本环比上升超阈值时生成告警
    - 实现 determineSeverity：超阈值 2 倍以上为 'critical'，否则为 'warning'
    - 实现 sortAlerts：按严重程度排序（critical 优先），同等严重程度按变化幅度降序
    - 提供默认阈值配置，阈值缺失时使用默认值并输出 console.warn
    - _需求: 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 5.3 编写属性测试：告警生成阈值正确性
    - **Property 11: 告警生成阈值正确性**
    - 使用 fast-check 生成任意利润率值和阈值配置，验证告警生成逻辑和 severity 判定正确
    - **验证需求: 9.2, 9.3, 9.4, 9.6**

  - [ ]* 5.4 编写属性测试：告警列表排序正确性
    - **Property 12: 告警列表排序正确性**
    - 使用 fast-check 生成任意 AlertItem 列表，验证排序后 critical 在 warning 之前，同等严重程度按变化幅度降序
    - **验证需求: 9.5**

  - [x] 5.3a 实现图表配置辅助函数
    - 创建 `src/utils/chartHelpers.ts`
    - 实现 buildMainTrendOption：生成主趋势柱线组合图 ECharts 配置
    - 实现 buildCostStructureOption：生成成本结构堆叠柱图配置
    - 实现 buildRevenueStructureOption：生成收入结构趋势图配置
    - 实现 buildWaterfallOption：生成利润瀑布图配置
    - 实现 buildPackageRankingOption：生成套餐盈利排行横向条形图配置
    - 实现 buildCostDetailOption：生成成本专项分析折线图配置
    - 每个函数包含 tooltip formatter 逻辑
    - _需求: 3.2, 3.3, 3.4, 3.5, 4.2, 4.3, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 7.1, 7.6, 8.1, 8.4_

  - [ ]* 5.5 编写属性测试：主趋势图 ECharts 配置正确性
    - **Property 5: 主趋势图配置正确性**
    - 使用 fast-check 生成任意 MainTrendResponse 数据，验证 option 中系列类型和轴绑定正确
    - **验证需求: 3.2, 3.3**

  - [ ]* 5.6 编写属性测试：Tooltip 格式化完整性
    - **Property 6: Tooltip 格式化完整性**
    - 使用 fast-check 生成任意图表数据点，验证 tooltip formatter 输出包含所有必需字段
    - **验证需求: 3.5, 4.3, 5.4, 6.4, 7.6, 8.4**

  - [ ]* 5.7 编写属性测试：成本结构堆叠图系列完整性
    - **Property 7: 成本结构堆叠图系列完整性**
    - 使用 fast-check 生成任意 CostStructureResponse 数据，验证 option 包含 5 个 bar 系列、相同 stack 属性、不同颜色
    - **验证需求: 4.2**

  - [ ]* 5.8 编写属性测试：收入结构图系列类型正确性
    - **Property 8: 收入结构图系列类型正确性**
    - 使用 fast-check 生成任意 RevenueStructureResponse 数据，验证 Meari/Customer 为 bar 堆叠，总收入为 line
    - **验证需求: 5.3**

  - [ ]* 5.9 编写属性测试：瀑布图数学一致性
    - **Property 9: 瀑布图数学一致性**
    - 使用 fast-check 生成任意 WaterfallResponse 数据，验证 totalRevenue - 各项成本 = profit（浮点精度内）
    - **验证需求: 6.1**

  - [ ]* 5.10 编写属性测试：套餐盈利排行降序排序
    - **Property 10: 套餐盈利排行降序排序**
    - 使用 fast-check 生成任意 PackageRankingItem 列表和指标选择，验证排序后相邻项满足降序
    - **验证需求: 7.4, 7.5**

- [x] 6. 检查点 - 确保基础层测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 7. 筛选栏组件
  - [x] 7.1 实现 FilterBar 组件
    - 创建 `src/components/FilterBar/FilterBar.tsx` 及对应 CSS Module
    - 使用 Ant Design DatePicker.RangePicker 实现时间范围选择
    - 使用 Ant Design Radio.Group 实现时间粒度切换（日/周/月，默认"日"）
    - 使用 Ant Design Select（mode="multiple"）实现订单类型、设备类型、套餐类型、套餐版本多选
    - 所有选择器默认选中"全部"（空数组表示全部）
    - 读写 Zustand Store 中的 filters 状态
    - _需求: 1.1, 1.2, 1.4, 1.5_

  - [ ]* 7.2 编写 FilterBar 组件单元测试
    - 验证渲染所有筛选组件
    - 验证默认状态
    - _需求: 1.1, 1.2_

- [x] 8. KPI 指标卡组件
  - [x] 8.1 实现 KPICard 单个指标卡组件
    - 创建 `src/components/KPICard/KPICard.tsx` 及对应 CSS Module
    - 渲染主数值、环比变化（正值绿色上箭头、负值红色下箭头）、迷你折线图（使用 ECharts mini chart）
    - 支持 highlighted 属性实现突出样式（更大字号/强调色）
    - 处理数据为空或异常时展示 "--"
    - _需求: 2.2, 2.3, 2.4_

  - [ ]* 8.2 编写属性测试：KPI 卡片环比变化方向指示正确性
    - **Property 3: KPI 环比变化方向指示正确性**
    - 使用 fast-check 生成任意 changePercent 值，验证正值→绿色上箭头、负值→红色下箭头、零→中性
    - **验证需求: 2.2, 2.4**

  - [x] 8.3 实现 KPICardRow 指标卡行容器组件
    - 创建 `src/components/KPICard/KPICardRow.tsx`
    - 消费 useKPIData hook 获取数据
    - 渲染 6 张 KPICard：每日可确认收入、每日成本预测、每日利润预测（突出）、利润率（突出）、套餐利润额 Top N、套餐利润率 Top N
    - 对收入、利润、利润率三张卡片设置 highlighted=true
    - Top N 卡片展示排名第一的产品名称及数值
    - _需求: 2.1, 2.3, 2.5, 2.6, 2.7_

  - [ ]* 8.4 编写属性测试：Top N 排行取值正确性
    - **Property 4: Top N 排行取值正确性**
    - 使用 fast-check 生成任意 PackageRankingItem 列表，验证 Top N 取值为指标最大值对应的产品
    - **验证需求: 2.6, 2.7**

- [x] 9. 图表组件实现
  - [x] 9.1 实现主趋势柱线组合图组件
    - 创建 `src/components/charts/MainTrendChart.tsx`
    - 消费 useMainTrendData hook，调用 buildMainTrendOption 生成配置
    - 柱图：可确认收入、成本预测；折线：利润预测、利润率（右侧百分比轴）
    - 实现点击事件：点击时间点更新 Zustand Store 的 drillDownDate
    - 处理加载中/错误/空数据状态
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 11.1_

  - [x] 9.2 实现成本结构堆叠柱图组件
    - 创建 `src/components/charts/CostStructureChart.tsx`
    - 消费 useCostStructureData hook，调用 buildCostStructureOption 生成配置
    - 5 项成本堆叠展示，不同颜色区分
    - 响应 drillDownDate 联动状态
    - _需求: 4.1, 4.2, 4.3, 4.4, 11.1_

  - [x] 9.3 实现收入结构趋势图组件
    - 创建 `src/components/charts/RevenueStructureChart.tsx`
    - 消费 useRevenueStructureData hook，调用 buildRevenueStructureOption 生成配置
    - 堆叠柱图：觅睿收款、客户收款；折线：总可确认收入
    - 响应 drillDownDate 联动状态
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 11.1_

  - [x] 9.4 实现利润瀑布图组件
    - 创建 `src/components/charts/WaterfallChart.tsx`
    - 消费 useWaterfallData hook，调用 buildWaterfallOption 生成配置
    - 从总收入开始逐步扣减各项成本至利润，不同颜色区分正值/负值/最终利润
    - 每个柱体展示数值标签
    - 响应 drillDownDate 联动状态
    - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 11.1_

  - [x] 9.5 实现套餐盈利能力排行条形图组件
    - 创建 `src/components/charts/PackageProfitRanking.tsx`
    - 消费 usePackageRankingData hook，调用 buildPackageRankingOption 生成配置
    - 提供维度切换控件（产品类型/套餐版本）和指标切换控件（利润额/利润率/收入/成本）
    - 按所选指标降序排列
    - 实现点击事件：点击条形更新 Zustand Store 的 drillDownProduct
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 11.2_

  - [x] 9.6 实现成本专项分析图表组组件
    - 创建 `src/components/charts/CostDetailCharts.tsx`
    - 消费 useCostDetailData hook，调用 buildCostDetailOption 生成配置
    - 展示三个子图表：支付平台手续费趋势、流量成本趋势、分成成本趋势（觅睿+客户）
    - _需求: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. 检查点 - 确保图表组件正常渲染
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 11. 异常监控组件
  - [x] 11.1 实现 AlertCard 单个告警卡片组件
    - 创建 `src/components/AlertMonitor/AlertCard.tsx` 及对应 CSS Module
    - 根据 severity 展示红色（critical）或橙色（warning）风险标识
    - 展示告警标题、异常产品/设备类型、当前值、阈值、变化幅度
    - _需求: 9.6_

  - [x] 11.2 实现 AlertMonitor 异常监控区域组件
    - 创建 `src/components/AlertMonitor/AlertMonitor.tsx`
    - 消费 useAlertData hook 获取告警数据
    - 调用 sortAlerts 排序后展示 Top N 告警卡片列表
    - 处理无告警时展示"当前无异常"提示
    - _需求: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 12. 图表联动交互 Hook
  - [x] 12.1 实现 useChartInteraction 联动交互 Hook
    - 创建 `src/hooks/useChartInteraction.ts`
    - 封装主趋势图时间点点击联动逻辑：更新 drillDownDate，再次点击同一时间点清除（toggle）
    - 封装套餐排行图产品点击联动逻辑：更新 drillDownProduct，再次点击同一产品清除（toggle）
    - 封装 clearDrillDown 清除所有联动状态
    - 各图表组件消费联动状态，根据 drillDownDate/drillDownProduct 过滤或高亮数据
    - _需求: 11.1, 11.2, 11.3, 11.4_

- [x] 13. 页面布局与整合
  - [x] 13.1 实现 DashboardPage 主页面布局组件
    - 创建 `src/components/DashboardPage.tsx` 及对应 CSS Module
    - 按视觉优先级排列模块：FilterBar → KPICardRow → MainTrendChart → (CostStructureChart + RevenueStructureChart 并排) → (WaterfallChart + PackageProfitRanking 并排) → (CostDetailCharts + AlertMonitor 并排)
    - 适配 1920px 及以上宽屏布局
    - 每个图表组件使用 React Error Boundary 包裹
    - _需求: 10.1, 10.2, 10.3_

  - [x] 13.2 整合 App.tsx 入口
    - 在 `src/App.tsx` 中配置 QueryClientProvider（React Query）
    - 渲染 DashboardPage
    - 引入全局主题样式
    - _需求: 10.1_

- [x] 14. 错误处理与边界状态
  - [x] 14.1 实现统一错误处理与空状态组件
    - 创建 ErrorBoundary 组件，捕获子组件渲染错误，展示友好提示
    - 创建 EmptyState 组件，展示"暂无数据"/"当前筛选条件下暂无数据"
    - 创建 LoadingState 组件，展示加载骨架屏
    - 在各图表组件中集成加载中/错误/空数据三种状态处理
    - _需求: 设计文档错误处理章节_

- [x] 15. 最终检查点 - 全量测试通过
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的子任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用具体需求编号，确保可追溯性
- 检查点任务确保增量验证
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况

# 需求文档：可确认收入&利润经营看板

## 简介

本看板面向运营团队，提供安防增值产品业务（云存、云存+4G、4G、云存+AI、AI）的经营预测分析能力。核心目标是帮助运营团队观察每日可确认收入趋势、利润趋势，识别最赚钱的套餐产品和异常业务结构，为运营策略提供数据参考。看板采用驾驶舱经营分析风格，覆盖觅睿收款和客户收款两类业务模式。

## 术语表

- **Dashboard（看板）**：可确认收入&利润经营看板的前端页面系统
- **Confirmed_Revenue（可确认收入）**：按业务口径确认的收入预测值，包含觅睿收款可确认收入预测和客户收款可确认收入预测
- **Cost_Prediction（成本预测）**：包含服务器成本预测、流量成本预测、支付平台手续费预测、觅睿收款分成成本预测、客户收款分成成本预测的总和
- **Profit_Prediction（利润预测）**：每日可确认收入预测减去每日成本预测的差值
- **Profit_Margin（利润率）**：利润预测除以可确认收入预测的百分比
- **Filter_Bar（筛选栏）**：页面顶部的统一筛选组件，包含时间范围、时间粒度、订单类型、设备类型、套餐类型、套餐版本
- **Time_Granularity（时间粒度）**：数据聚合的时间维度，支持日、周、月三种粒度
- **Product_Type（产品类型）**：安防增值产品的业务分类，包括云存、云存+4G、4G、云存+AI、AI
- **Package_Version（套餐版本）**：同一产品类型下的不同套餐配置版本
- **Order_Type（订单类型）**：订单的业务分类维度
- **Device_Type（设备类型）**：设备的硬件分类维度
- **KPI_Card（指标卡）**：顶部核心指标展示区域的单个指标展示组件
- **Meari_Revenue（觅睿收款可确认收入）**：通过觅睿收款模式产生的可确认收入预测
- **Customer_Revenue（客户收款可确认收入）**：通过客户收款模式产生的可确认收入预测
- **Server_Cost（服务器成本）**：服务器资源消耗产生的成本预测
- **Traffic_Cost（流量成本）**：网络流量消耗产生的成本预测
- **Payment_Fee（支付平台手续费）**：支付平台收取的交易手续费预测
- **Meari_Share_Cost（觅睿收款分成成本）**：觅睿收款模式下的分成成本预测
- **Customer_Share_Cost（客户收款分成成本）**：客户收款模式下的分成成本预测
- **Alert_Card（告警卡片）**：异常监控区域中展示异常信息的卡片组件
- **Waterfall_Chart（瀑布图）**：展示利润从收入到各项成本扣减过程的图表类型

## 需求

### 需求 1：顶部统一筛选栏

**用户故事：** 作为运营人员，我希望通过统一筛选栏快速切换分析维度，以便从不同角度观察经营数据。

#### 验收标准

1. THE Dashboard SHALL 在页面顶部展示统一 Filter_Bar，包含时间范围选择器、Time_Granularity 切换器（日/周/月）、Order_Type 选择器、Device_Type 选择器、套餐类型选择器、Package_Version 选择器
2. THE Filter_Bar SHALL 默认展示全量数据，所有筛选条件默认选中"全部"
3. WHEN 用户修改 Filter_Bar 中任一筛选条件时，THE Dashboard SHALL 联动更新页面内所有图表和 KPI_Card 的数据
4. THE Filter_Bar 中的 Order_Type、Device_Type、套餐类型、Package_Version 选择器 SHALL 支持多选操作
5. THE Filter_Bar 中的 Time_Granularity 切换器 SHALL 提供日、周、月三个互斥选项，默认选中"日"
6. WHEN 用户切换 Time_Granularity 时，THE Dashboard SHALL 按所选粒度重新聚合所有图表的时间轴数据

### 需求 2：顶部 KPI 核心指标区

**用户故事：** 作为运营人员，我希望一眼看到关键经营指标的当前值和变化趋势，以便快速判断经营状况。

#### 验收标准

1. THE Dashboard SHALL 在 Filter_Bar 下方展示 6 张 KPI_Card，分别为：每日 Confirmed_Revenue、每日 Cost_Prediction、每日 Profit_Prediction、Profit_Margin、套餐利润额 Top N、套餐 Profit_Margin Top N
2. THE KPI_Card SHALL 展示主数值、环比变化值（较上一周期的变化百分比）、简易趋势迷你折线图
3. THE Dashboard SHALL 对 Confirmed_Revenue、Profit_Prediction、Profit_Margin 三张 KPI_Card 采用视觉突出样式（更大字号或强调色）
4. WHEN 环比变化为正值时，THE KPI_Card SHALL 以绿色向上箭头展示变化值；WHEN 环比变化为负值时，THE KPI_Card SHALL 以红色向下箭头展示变化值
5. WHEN 用户修改 Filter_Bar 筛选条件时，THE KPI_Card SHALL 根据筛选结果重新计算并展示对应指标值
6. THE 套餐利润额 Top N 的 KPI_Card SHALL 展示当前筛选条件下利润额排名第一的 Product_Type 名称及其利润额数值
7. THE 套餐 Profit_Margin Top N 的 KPI_Card SHALL 展示当前筛选条件下 Profit_Margin 排名第一的 Product_Type 名称及其 Profit_Margin 数值

### 需求 3：可确认收入/成本/利润主趋势分析

**用户故事：** 作为运营人员，我希望通过趋势图直观观察收入、成本和利润的变化走势，以便发现经营趋势和拐点。

#### 验收标准

1. THE Dashboard SHALL 在 KPI 指标区下方展示一张柱线组合趋势图，横轴为时间（按当前 Time_Granularity 聚合），纵轴为金额
2. THE 趋势图 SHALL 以柱图形式展示 Confirmed_Revenue 和 Cost_Prediction，以折线形式展示 Profit_Prediction 和 Profit_Margin
3. THE Profit_Margin 折线 SHALL 使用独立的右侧纵轴（百分比刻度）
4. THE 趋势图 SHALL 对 Confirmed_Revenue 柱图、Cost_Prediction 柱图、Profit_Prediction 折线、Profit_Margin 折线使用不同颜色进行视觉区分
5. WHEN 用户将鼠标悬停在趋势图的数据点上时，THE Dashboard SHALL 展示该时间点的 Confirmed_Revenue、Cost_Prediction、Profit_Prediction、Profit_Margin 的具体数值提示框
6. WHEN 用户修改 Filter_Bar 筛选条件时，THE 趋势图 SHALL 根据筛选结果重新渲染数据

### 需求 4：成本结构趋势分析

**用户故事：** 作为运营人员，我希望了解各项成本的构成和变化趋势，以便识别成本增长的驱动因素。

#### 验收标准

1. THE Dashboard SHALL 展示一张成本结构堆叠柱图，横轴为时间（按当前 Time_Granularity 聚合），纵轴为成本金额
2. THE 成本结构图 SHALL 将 Server_Cost、Traffic_Cost、Payment_Fee、Meari_Share_Cost、Customer_Share_Cost 以不同颜色堆叠展示
3. WHEN 用户将鼠标悬停在成本结构图的数据点上时，THE Dashboard SHALL 展示该时间点各项成本的具体数值和占比提示框
4. WHEN 用户修改 Filter_Bar 筛选条件时，THE 成本结构图 SHALL 根据筛选结果重新渲染数据

### 需求 5：收入结构趋势分析

**用户故事：** 作为运营人员，我希望了解觅睿收款和客户收款两种模式的收入构成和变化趋势，以便评估不同收款模式的贡献。

#### 验收标准

1. THE Dashboard SHALL 展示一张收入结构趋势图，横轴为时间（按当前 Time_Granularity 聚合），纵轴为收入金额
2. THE 收入结构图 SHALL 展示 Meari_Revenue、Customer_Revenue 和总 Confirmed_Revenue 三条数据系列
3. THE 收入结构图 SHALL 以堆叠柱图展示 Meari_Revenue 和 Customer_Revenue，以折线展示总 Confirmed_Revenue
4. WHEN 用户将鼠标悬停在收入结构图的数据点上时，THE Dashboard SHALL 展示该时间点 Meari_Revenue、Customer_Revenue、总 Confirmed_Revenue 的具体数值提示框
5. WHEN 用户修改 Filter_Bar 筛选条件时，THE 收入结构图 SHALL 根据筛选结果重新渲染数据

### 需求 6：利润瀑布图分析

**用户故事：** 作为运营人员，我希望通过瀑布图直观看到从收入到利润的逐步扣减过程，以便理解利润的形成路径。

#### 验收标准

1. THE Dashboard SHALL 展示一张 Waterfall_Chart，从总 Confirmed_Revenue 开始，依次扣减 Server_Cost、Traffic_Cost、Payment_Fee、Meari_Share_Cost、Customer_Share_Cost，最终展示 Profit_Prediction
2. THE Waterfall_Chart SHALL 以不同颜色区分收入项（正值）、成本扣减项（负值）和最终利润项
3. THE Waterfall_Chart 中每个柱体 SHALL 展示对应的数值标签
4. WHEN 用户将鼠标悬停在 Waterfall_Chart 的柱体上时，THE Dashboard SHALL 展示该项的具体数值和占总收入的百分比提示框
5. WHEN 用户修改 Filter_Bar 筛选条件时，THE Waterfall_Chart SHALL 根据筛选结果重新计算并渲染数据

### 需求 7：套餐盈利能力排行分析

**用户故事：** 作为运营人员，我希望对比不同套餐产品的盈利能力，以便识别最赚钱的产品和需要优化的产品。

#### 验收标准

1. THE Dashboard SHALL 展示一张套餐盈利能力横向条形图，默认按 Product_Type 维度展示各产品的 Profit_Prediction 排行
2. THE 套餐盈利能力图 SHALL 提供维度切换控件，支持在 Product_Type 和 Package_Version 之间切换展示维度
3. THE 套餐盈利能力图 SHALL 提供指标切换控件，支持在利润额、Profit_Margin、Confirmed_Revenue、Cost_Prediction 之间切换展示指标
4. THE 套餐盈利能力图 SHALL 按所选指标从高到低排序展示
5. WHEN 用户切换维度或指标时，THE 套餐盈利能力图 SHALL 重新排序并渲染数据
6. WHEN 用户将鼠标悬停在条形图的条形上时，THE Dashboard SHALL 展示该套餐的利润额、Profit_Margin、Confirmed_Revenue、Cost_Prediction 的完整数值提示框
7. WHEN 用户修改 Filter_Bar 筛选条件时，THE 套餐盈利能力图 SHALL 根据筛选结果重新渲染数据

### 需求 8：成本专项分析

**用户故事：** 作为运营人员，我希望深入分析各项成本的细节，以便发现成本优化的机会。

#### 验收标准

1. THE Dashboard SHALL 展示支付平台手续费分析图表，按时间趋势展示 Payment_Fee 的变化
2. THE Dashboard SHALL 展示流量成本分析图表，按时间趋势展示 Traffic_Cost 的变化
3. THE Dashboard SHALL 展示分成成本分析图表，按时间趋势展示 Meari_Share_Cost 和 Customer_Share_Cost 的变化
4. WHEN 用户将鼠标悬停在成本专项分析图表的数据点上时，THE Dashboard SHALL 展示该时间点的具体成本数值提示框
5. WHEN 用户修改 Filter_Bar 筛选条件时，THE 成本专项分析图表 SHALL 根据筛选结果重新渲染数据

### 需求 9：异常监控与告警

**用户故事：** 作为运营人员，我希望系统自动识别经营异常指标，以便及时发现风险并采取措施。

#### 验收标准

1. THE Dashboard SHALL 展示异常监控区域，包含 Alert_Card 列表
2. WHEN Profit_Margin 低于预设阈值时，THE Dashboard SHALL 生成一张利润率异常 Alert_Card，展示异常的 Product_Type 名称、当前 Profit_Margin 值和阈值
3. WHEN Payment_Fee 费率较上一周期上升超过预设阈值时，THE Dashboard SHALL 生成一张手续费率异常 Alert_Card，展示异常的费率变化幅度
4. WHEN 单设备 Traffic_Cost 较上一周期上升超过预设阈值时，THE Dashboard SHALL 生成一张流量成本异常 Alert_Card，展示异常的设备类型和成本变化幅度
5. THE 异常监控区域 SHALL 展示异常项的 Top N 排行榜单
6. THE Alert_Card SHALL 以红色或橙色风险标识区分异常严重程度


### 需求 10：页面布局与视觉风格

**用户故事：** 作为运营人员，我希望看板具有专业的驾驶舱风格和清晰的视觉层次，以便高效获取关键信息。

#### 验收标准

1. THE Dashboard SHALL 采用驾驶舱经营分析风格，整体视觉专业、简洁、现代化
2. THE Dashboard SHALL 适配宽屏看板展示，页面布局在 1920px 及以上宽度下正常展示
3. THE Dashboard SHALL 按以下视觉优先级排列模块：主趋势分析区（最高）> 套餐盈利能力分析区（次高）> 成本结构分析区与异常监控区（较低）
4. THE Dashboard SHALL 对 Confirmed_Revenue、Cost_Prediction、Profit_Prediction 使用明确不同的视觉颜色进行区分
5. THE Dashboard SHALL 采用深色或商务风格配色方案，避免财务报表风格的纯白底表格布局

### 需求 11：图表交互能力

**用户故事：** 作为运营人员，我希望图表之间支持联动交互，以便进行深入的下钻分析。

#### 验收标准

1. WHEN 用户点击主趋势图中某个时间点的数据时，THE Dashboard SHALL 联动更新成本结构图、收入结构图、Waterfall_Chart 展示该时间点的详细数据
2. WHEN 用户点击套餐盈利能力图中某个 Product_Type 的条形时，THE Dashboard SHALL 联动筛选其他图表仅展示该 Product_Type 的数据
3. THE Dashboard 中所有图表 SHALL 支持鼠标悬停展示数据提示框（Tooltip）
4. THE Dashboard 中所有趋势类图表 SHALL 支持图例点击显示/隐藏对应数据系列

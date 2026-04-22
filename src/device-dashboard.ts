// src/device-dashboard.ts
// 设备驾驶舱 - 需求文档重构版 | 左右分栏 + A/B/C三类时间模块
import * as echarts from 'echarts';

// ==============================================
// 全局配置（严格遵循需求文档 5.1 / 5.2 / 8.1）
// ==============================================
let statEndDate = new Date();
let globalTimeRange = '30d';
let timeGranularity = 'day';
let realUpdateTime = new Date();

// 业务筛选（全模块生效）
const bizFilter = { region: '', channel: '', model: '', powerType: '', lifeCycle: '' };
// B类模块独立时间（近24h/7d/30d）
const bModuleTime = { power: '24h', preview: '24h', offlineTop: '24h', abnormalTop: '24h' };

// ==============================================
// 页面初始化入口
// ==============================================
export function initDeviceDashboard() {
  const root = document.getElementById('device-dashboard')!;
  root.innerHTML = '';
  root.className = 'device-cockpit';
  
  // 渲染筛选栏 + 时间口径 + 布局
  renderFilter();
  renderTimeTips();
  renderLayout();
  initAllCharts();
  bindEvents();
  startRealTimeRefresh();
}

// ==============================================
// 1. 顶部筛选区（需求 5.1）
// ==============================================
function renderFilter() {
  const container = document.querySelector('.device-cockpit')!;
  container.innerHTML += `
    <div class="filter-bar">
      <input type="date" id="statEndDate" class="filter-item">
      <select id="timeRange" class="filter-item">
        <option value="30d">近30天</option><option value="90d">近90天</option>
      </select>
      <select id="granularity" class="filter-item">
        <option value="day">日</option><option value="week">周</option><option value="month">月</option>
      </select>
      <select class="filter-item">区域</select>
      <select class="filter-item">机型</select>
      <select class="filter-item">供电方式</select>
      <button id="query" class="btn">查询</button>
    </div>
  `;
}

// ==============================================
// 2. 时间口径展示（需求 8.1）
// ==============================================
function renderTimeTips() {
  const container = document.querySelector('.device-cockpit')!;
  container.innerHTML += `
    <div class="time-hint">
      <span>📅 统计截止日：${statEndDate.toLocaleDateString()}</span>
      <span>🔄 实时更新时间：${realUpdateTime.toLocaleString()}</span>
    </div>
  `;
}

// ==============================================
// 3. 左右分栏布局（需求 2.1）
// ==============================================
function renderLayout() {
  const container = document.querySelector('.device-cockpit')!;
  container.innerHTML += `
    <div class="layout">
      <!-- 左侧：全局分析区 A类 + 截面快照 -->
      <div class="left">
        <div class="kpi-row">
          <div class="kpi">设备总数<h3>15860</h3></div>
          <div class="kpi">激活设备数<h3>14230</h3></div>
          <div class="kpi">活跃设备数<h3>11890</h3></div>
          <div class="kpi">流失设备数<h3>1630</h3></div>
        </div>
        <div class="chart" id="scaleTrend"></div>
        <div class="chart" id="networkTrend"></div>
        <div class="chart" id="chargeTrend"></div>
        <div class="chart" id="highPowerTrend"></div>
        <div class="chart" id="sdTrend"></div>
        <div class="chart" id="structureDist"></div>
      </div>

      <!-- 右侧：独立监控区 C类 + B类 -->
      <div class="right">
        <div class="real-kpi">
          <div class="kpi">实时在线率<h3>97.8%</h3></div>
          <div class="kpi">在线设备数<h3>12450</h3></div>
          <div class="kpi">离线设备数<h3>280</h3></div>
        </div>
        <div class="chart" id="online24h"></div>

        <select class="b-select" id="powerTime">近24h/近7d/近30d</select>
        <div class="chart" id="powerDist"></div>

        <select class="b-select" id="previewTime">近24h/近7d</select>
        <div class="chart" id="previewDist"></div>

        <div class="topn">高频离线设备 TopN</div>
        <div class="topn">高频异常设备 TopN</div>
        <div class="link">专题诊断入口</div>
      </div>
    </div>
  `;
}

// ==============================================
// 4. 图表初始化
// ==============================================
function initAllCharts() {
  const chartIds = [
    'scaleTrend','networkTrend','chargeTrend','highPowerTrend','sdTrend',
    'structureDist','online24h','powerDist','previewDist'
  ];
  chartIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) echarts.init(el).setOption({});
  });
}

// ==============================================
// 5. 交互规则（需求 7）
// ==============================================
function bindEvents() {
  // 时间修改 → 仅刷新左侧A类
  document.querySelectorAll('#statEndDate,#timeRange,#granularity').forEach(el => {
    el.addEventListener('change', refreshAModules);
  });
  // 业务查询 → 全模块刷新
  document.getElementById('query')!.addEventListener('click', refreshAll);
  // B类时间切换 → 仅刷新当前模块
  document.querySelectorAll('.b-select').forEach(el => {
    el.addEventListener('change', refreshSingleBModule);
  });
}

// 刷新逻辑
function refreshAModules() {} // 仅左侧
function refreshSingleBModule() {} // 仅当前B模块
function refreshCModule() { realUpdateTime = new Date(); renderTimeTips(); }
function refreshAll() { refreshAModules(); refreshCModule(); }

// 实时模块 3分钟刷新
function startRealTimeRefresh() {
  setInterval(refreshCModule, 180000);
}

// ==============================================
// 样式（适配你的项目）
// ==============================================
export const dashboardStyle = `
  .device-cockpit { padding:20px; background:#f5f7fa; min-height:100vh; }
  .filter-bar { display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
  .filter-item { padding:6px 8px; }
  .time-hint { display:flex; gap:24px; color:#666; margin-bottom:16px; }
  .layout { display:flex; gap:20px; }
  .left { flex:6; }
  .right { flex:4; }
  .kpi-row,.real-kpi { display:flex; gap:12px; margin-bottom:16px; }
  .kpi { flex:1; background:#fff; padding:16px; border-radius:8px; text-align:center; }
  .chart { height:260px; background:#fff; border-radius:8px; margin-bottom:16px; }
  .b-select { margin-bottom:8px; padding:4px; }
  .topn { height:120px; background:#fff; border-radius:8px; margin-bottom:12px; }
  .link { padding:12px; background:#e8f3ff; border-radius:8px; text-align:center; }
`;

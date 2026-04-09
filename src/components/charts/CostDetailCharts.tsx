import { useState } from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useCostDetailData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../utils/formatters';
import styles from './ChartCard.module.css';

const COLORS = {
  paymentFee: '#d2a8ff',
  trafficCost: '#f0883e',
  trafficCost4G: '#f0883e',
  cardFeeCost: '#d4a373',
  meariShare: '#79c0ff',
  customerShare: '#56d364',
  textSecondary: '#8b949e',
  borderColor: '#30363d',
  bgSecondary: '#161b22',
  textPrimary: '#e6edf3',
};

const GRANULARITY_SUBTITLE: Record<string, string> = {
  week: '近8周趋势',
  month: '近6个月趋势',
};

// 供应商数据比例（模拟不同供应商占比）
const SUPPLIER_RATIOS: Record<string, { traffic4G: number; cardFee: number }> = {
  all: { traffic4G: 1, cardFee: 1 },
  lingke: { traffic4G: 0.45, cardFee: 0.40 },
  telecom: { traffic4G: 0.30, cardFee: 0.35 },
  mobile: { traffic4G: 0.25, cardFee: 0.25 },
};

// 支付渠道比例（模拟不同支付渠道占比）
const PAYMENT_CHANNEL_RATIOS: Record<string, number> = {
  all: 1,
  apple: 0.35,
  google: 0.25,
  paypal: 0.15,
  wechat: 0.10,
  alipay: 0.10,
  airwallex: 0.05,
};

/** 将一条数据线拆成历史和预测两段 */
function splitHistoryForecast(
  data: number[],
  forecastStartIndex: number,
): { history: (number | null)[]; forecast: (number | null)[] } {
  const history = data.map((v, i) => (i < forecastStartIndex ? v : null));
  const forecast = data.map((v, i) => (i >= forecastStartIndex - 1 ? v : null));
  return { history, forecast };
}

function buildSubChartOption(
  dates: string[],
  seriesList: Array<{ name: string; data: number[]; color: string }>,
  dateRanges?: string[],
  forecastStartIndex?: number,
): Record<string, unknown> {
  const fsi = forecastStartIndex;
  const hasForecast = fsi != null && fsi > 0 && fsi < dates.length;

  const allSeries: Record<string, unknown>[] = [];

  for (let si = 0; si < seriesList.length; si++) {
    const s = seriesList[si];
    if (hasForecast) {
      const { history, forecast } = splitHistoryForecast(s.data, fsi!);
      const historySeries: Record<string, unknown> = {
        name: s.name,
        type: 'line',
        data: history,
        itemStyle: { color: s.color },
        lineStyle: { color: s.color, type: 'solid' },
        smooth: true,
      };
      if (si === 0) {
        historySeries.markLine = {
          silent: true,
          symbol: ['none', 'arrow'],
          symbolSize: [0, 8],
          lineStyle: { color: 'rgba(255, 255, 255, 0.35)', type: [4, 4], width: 1.5 },
          label: {
            show: true,
            formatter: '← 历史 | 预测 →',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 10,
            fontWeight: 500,
            position: 'insideEndTop',
            backgroundColor: 'rgba(22, 27, 34, 0.85)',
            padding: [3, 6],
            borderRadius: 4,
          },
          data: [{ xAxis: dates[fsi!] }],
        };
      }
      allSeries.push(historySeries);
      allSeries.push({
        name: s.name,
        type: 'line',
        data: forecast,
        itemStyle: { color: s.color },
        lineStyle: { color: s.color, type: 'dashed' },
        smooth: true,
      });
    } else {
      allSeries.push({
        name: s.name,
        type: 'line',
        data: s.data,
        itemStyle: { color: s.color },
        lineStyle: { color: s.color },
        smooth: true,
      });
    }
  }

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: COLORS.bgSecondary,
      borderColor: COLORS.borderColor,
      textStyle: { color: COLORS.textPrimary, fontSize: 12 },
      formatter(params: Array<{ seriesName: string; value: number | null; marker: string; axisValue?: string; dataIndex: number }>) {
        if (!Array.isArray(params) || params.length === 0) return '';
        const idx = params[0].dataIndex;
        const rangeText = dateRanges?.[idx];
        const headerLabel = rangeText ?? params[0]?.axisValue ?? '';
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
    legend: {
      data: seriesList.map((s) => s.name),
      textStyle: { color: COLORS.textSecondary, fontSize: 11 },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: COLORS.textSecondary, fontSize: 11 },
      axisLine: { lineStyle: { color: COLORS.borderColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: COLORS.textSecondary, fontSize: 11 },
      splitLine: { lineStyle: { color: COLORS.borderColor, type: 'dashed' } },
    },
    series: allSeries,
  };
}

const CostDetailCharts: React.FC = () => {
  const { data, isLoading, isError, refetch } = useCostDetailData();
  const timeGranularity = useDashboardStore((s) => s.filters.timeGranularity);
  const isDailyGranularity = timeGranularity === 'day';
  const [supplier, setSupplier] = useState<string>('all');
  const [expandedCost, setExpandedCost] = useState<string | null>(null);

  const hasDates = data?.dates && data.dates.length > 0;
  const ranges = data?.dateRanges;
  const fsi = data?.forecastStartIndex;

  // 根据供应商比例计算数据
  const ratio = SUPPLIER_RATIOS[supplier] ?? SUPPLIER_RATIOS.all;
  const traffic4GData = data?.trafficCost4G?.map(v => Math.round(v * ratio.traffic4G * 100) / 100) ?? [];
  const cardFeeData = data?.cardFeeCost?.map(v => Math.round(v * ratio.cardFee * 100) / 100) ?? [];

  // 各支付渠道手续费数据（多条线）
  const channelColors: Record<string, string> = {
    apple: '#f85149', google: '#3fb950', paypal: '#58a6ff',
    wechat: '#3fb950', alipay: '#58a6ff', airwallex: '#e6c07b',
  };
  const channelLabels: Record<string, string> = {
    apple: '苹果', google: '谷歌', paypal: 'PayPal',
    wechat: '微信', alipay: '支付宝', airwallex: '空中云汇',
  };
  const paymentFeeSeries = hasDates ? [
    { name: '全部渠道', data: data!.paymentFee, color: COLORS.paymentFee },
    ...Object.entries(PAYMENT_CHANNEL_RATIOS)
      .filter(([k]) => k !== 'all')
      .map(([k, r]) => ({
        name: channelLabels[k],
        data: data!.paymentFee.map(v => Math.round(v * r * 100) / 100),
        color: channelColors[k] ?? '#8b949e',
      })),
  ] : [];

  const paymentFeeOption = hasDates
    ? buildSubChartOption(data!.dates, paymentFeeSeries, ranges, fsi)
    : {};

  const trafficCostOption = hasDates && !isDailyGranularity
    ? buildSubChartOption(data!.dates, [
        { name: '4G卡流量', data: traffic4GData, color: COLORS.trafficCost4G },
        { name: '4G卡费', data: cardFeeData, color: COLORS.cardFeeCost },
      ], ranges, fsi)
    : {};

  const shareCostOption = hasDates
    ? buildSubChartOption(data!.dates, [
        { name: '觅睿分成', data: data!.meariShareCost, color: COLORS.meariShare },
        { name: '客户分成', data: data!.customerShareCost, color: COLORS.customerShare },
      ], ranges, fsi)
    : {};

  const trafficCost4GMonthly = traffic4GData.reduce((a, b) => a + b, 0);
  const cardFeeCostMonthly = cardFeeData.reduce((a, b) => a + b, 0);

  const supplierLabel = supplier === 'all' ? '' : supplier === 'lingke' ? '（领科）' : supplier === 'telecom' ? '（电信）' : '（移动）';

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        成本预测专项分析
        {GRANULARITY_SUBTITLE[timeGranularity] && (
          <span style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 }}>
            （{GRANULARITY_SUBTITLE[timeGranularity]}）
          </span>
        )}
      </div>
      {isLoading && <div className={styles.statusContainer}>加载中...</div>}
      {isError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>数据加载失败</span>
          <button className={styles.retryButton} onClick={() => refetch()}>重试</button>
        </div>
      )}
      {!isLoading && !isError && !hasDates && <div className={styles.statusContainer}>暂无数据</div>}
      {!isLoading && !isError && hasDates && (
        <>
        <div className={styles.subChartsGrid}>
          <div className={styles.subChartItem}>
            <div className={styles.subChartTitle}>支付平台手续费预测趋势（按渠道）</div>
            <ReactECharts option={paymentFeeOption} style={{ width: '100%', height: 260 }} opts={{ renderer: 'canvas' }} />
          </div>
          <div className={styles.subChartItem}>
            <div className={styles.subChartTitle}>分成成本预测趋势</div>
            <ReactECharts option={shareCostOption} style={{ width: '100%', height: 260 }} opts={{ renderer: 'canvas' }} />
          </div>
          <div className={styles.subChartItem}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className={styles.subChartTitle} style={{ marginBottom: 0 }}>
                流量成本预测{isDailyGranularity ? '（月度汇总）' : '趋势'}{supplierLabel}
              </div>
              <Radio.Group
                value={supplier}
                onChange={(e: RadioChangeEvent) => setSupplier(e.target.value)}
                size="small"
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: '全部', value: 'all' },
                  { label: '领科', value: 'lingke' },
                  { label: '电信', value: 'telecom' },
                  { label: '移动', value: 'mobile' },
                ]}
              />
            </div>
            {isDailyGranularity ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 230, gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.trafficCost4G }}>{formatCurrency(trafficCost4GMonthly)}</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>4G卡流量</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.cardFeeCost }}>{formatCurrency(cardFeeCostMonthly)}</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>4G卡费</div>
                </div>
              </div>
            ) : (
              <ReactECharts option={trafficCostOption} style={{ width: '100%', height: 230 }} opts={{ renderer: 'canvas' }} />
            )}
          </div>
        </div>
        {/* 成本占比说明 - 点击显示口径解释 */}
        <div style={{ padding: '12px 0 0' }}>
          <div style={{ display: 'flex', gap: 20, fontSize: 12, color: COLORS.textSecondary, flexWrap: 'wrap' }}>
            {[
              { key: 'paymentFee', color: COLORS.paymentFee, label: '手续费预测', desc: '第三方支付渠道（苹果、谷歌、PayPal、微信、支付宝、空中云汇）按交易金额收取的手续费预测' },
              { key: 'trafficCost4G', color: COLORS.trafficCost4G, label: '4G卡流量预测', desc: '4G设备产生的数据流量费用预测，按供应商（领科、电信、移动）分别计费' },
              { key: 'cardFeeCost', color: COLORS.cardFeeCost, label: '4G卡费预测', desc: '4G SIM卡月租费用预测，按供应商（领科、电信、移动）分别计费' },
              { key: 'meariShare', color: COLORS.meariShare, label: '觅睿分成预测', desc: '觅睿收款模式下平台方按约定比例收取的收入分成预测' },
              { key: 'customerShare', color: COLORS.customerShare, label: '客户分成预测', desc: '客户收款模式下合作客户按约定比例收取的收入分成预测' },
            ].map((item) => (
              <div
                key={item.key}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: expandedCost && expandedCost !== item.key ? 0.5 : 1 }}
                onClick={() => setExpandedCost(expandedCost === item.key ? null : item.key)}
              >
                <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, display: 'inline-block' }} />
                <span style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{item.label}</span>
              </div>
            ))}
          </div>
          {expandedCost && (
            <div style={{
              marginTop: 8,
              padding: '8px 12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              fontSize: 12,
              color: COLORS.textPrimary,
              lineHeight: 1.6,
            }}>
              {[
                { key: 'paymentFee', desc: '第三方支付渠道（苹果、谷歌、PayPal、微信、支付宝、空中云汇）按交易金额收取的手续费预测。不同渠道费率不同，可通过上方支付渠道按钮切换查看。' },
                { key: 'trafficCost4G', desc: '4G设备产生的数据流量费用预测。按供应商（领科、电信、移动）分别计费，仅支持月度统计口径，日粒度下展示月度汇总。' },
                { key: 'cardFeeCost', desc: '4G SIM卡月租费用预测。按供应商（领科、电信、移动）分别计费，与流量成本共同构成4G设备运营成本。' },
                { key: 'meariShare', desc: '觅睿收款模式下，平台方按约定比例从可确认收入中收取的分成成本预测。分成比例与套餐类型和合作协议相关。' },
                { key: 'customerShare', desc: '客户收款模式下，合作客户按约定比例从可确认收入中收取的分成成本预测。分成比例与客户协议相关。' },
              ].find((i) => i.key === expandedCost)?.desc}
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default CostDetailCharts;

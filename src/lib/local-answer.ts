import { formatMoney, formatRate, toNumber } from './format'
import { summarize, withMetrics, type Holding, type HoldingMetrics } from './portfolio'

export function answerFromHoldings(question: string, holdings: Holding[]): string {
  const text = question.trim()
  const rows = withMetrics(holdings)
  if (rows.length === 0) return '当前持仓数据里没有这一项'

  const summary = summarize(holdings)

  let heaviest = rows[0]
  for (const row of rows) {
    if (toNumber(row.contribution) < toNumber(heaviest.contribution)) heaviest = row
  }

  const largestHolding: HoldingMetrics = [...rows].sort(
    (a, b) => toNumber(b.weight) - toNumber(a.weight),
  )[0]
  const weight = toNumber(largestHolding.weight)

  if (/拖后腿|最差|亏最多/.test(text)) {
    const label = toNumber(heaviest.contribution) < 0 ? '拖累最大' : '贡献最低'
    return `${label}的是 ${heaviest.name}，占组合 ${(toNumber(heaviest.weight) * 100).toFixed(
      1,
    )}%，收益贡献 ${(toNumber(heaviest.contribution) * 100).toFixed(2)}%`
  }

  if (/集中|风险/.test(text)) {
    const advice = weight > 0.3 ? '集中度偏高，建议适当分散持仓' : '持仓较为均衡'
    return `最大单一持仓占比 ${(weight * 100).toFixed(1)}%，${advice}`
  }

  if (/赚|亏|整体/.test(text)) {
    return `总市值 ${formatMoney(summary.totalMarketValue)} 元，总收益 ${formatMoney(
      summary.totalProfit,
    )} 元，总收益率 ${(summary.totalRate * 100).toFixed(2)}%`
  }

  if (/客户|解释|话术/.test(text)) {
    const overall = summary.totalProfit >= 0 ? '整体实现正收益' : '当前整体处于浮亏'
    const drag =
      toNumber(heaviest.contribution) < 0 ? `${heaviest.name}拖累较大` : '各基金表现平稳'
    return `您好，当前组合总市值 ${formatMoney(summary.totalMarketValue)} 元，${overall}，${drag}，建议结合自身风险偏好调整持仓。`
  }

  return '我目前能回答持仓收益、集中度、客户话术三类问题'
}

export function offlineClientCard(holdings: Holding[]): string {
  const rows = withMetrics(holdings)
  if (rows.length === 0) return '当前持仓数据里没有这一项'

  const summary = summarize(holdings)

  let heaviest = rows[0]
  for (const row of rows) {
    if (toNumber(row.contribution) < toNumber(heaviest.contribution)) heaviest = row
  }

  const overall = summary.totalProfit >= 0 ? '整体实现正收益' : '当前整体处于浮亏'
  const drag =
    toNumber(heaviest.contribution) < 0
      ? `其中${heaviest.name}拖累较大，占组合约 ${(toNumber(heaviest.weight) * 100).toFixed(1)}%`
      : '各基金表现整体平稳'

  return `您好，为您梳理一下当前持仓：组合总市值 ${formatMoney(
    summary.totalMarketValue,
  )} 元，累计收益 ${formatMoney(summary.totalProfit)} 元，综合收益率 ${formatRate(
    summary.totalRate,
  )}，${overall}。${drag}。建议结合自身风险偏好，对拖累较大的品种做适当调整，保持持仓均衡。以上为持仓信息整理，不构成投资建议。`
}

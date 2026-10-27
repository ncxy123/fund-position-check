import { toNumber } from './format'

export interface Holding {
  id: string
  name: string
  marketValue: number | null
  profit: number | null
}

export interface HoldingMetrics extends Holding {
  rate: number
  contribution: number
  weight: number
}

export interface PortfolioSummary {
  totalMarketValue: number
  totalProfit: number
  totalRate: number
  worst: HoldingMetrics | null
  worstWeight: number
  worstContribution: number
  worstIsNegative: boolean
}

export interface Deduction {
  dimension: string
  desc: string
  points: number
}

export interface HealthReport {
  score: number
  maxWeight: number
  lossRatio: number
  comment: string
  deductions: Deduction[]
}

export function isValidHolding(holding: Holding): boolean {
  const marketValue = toNumber(holding.marketValue)
  const profit = toNumber(holding.profit)
  return marketValue !== 0 && (holding.name?.trim().length ?? 0) > 0 && marketValue - profit !== 0
}

export function rateOf(marketValue: number, profit: number): number {
  const cost = marketValue - profit
  return cost === 0 ? 0 : profit / cost
}

export function withMetrics(holdings: Holding[]): HoldingMetrics[] {
  const valid = holdings.filter(isValidHolding)
  const totalMarketValue = valid.reduce((sum, item) => sum + toNumber(item.marketValue), 0)
  const totalCost = totalMarketValue - valid.reduce((sum, item) => sum + toNumber(item.profit), 0)

  return valid.map((item) => {
    const marketValue = toNumber(item.marketValue)
    const profit = toNumber(item.profit)
    return {
      ...item,
      rate: rateOf(marketValue, profit),
      contribution: totalCost === 0 ? 0 : profit / totalCost,
      weight: totalMarketValue === 0 ? 0 : marketValue / totalMarketValue,
    }
  })
}

export function summarize(holdings: Holding[]): PortfolioSummary {
  const rows = withMetrics(holdings)
  const totalMarketValue = rows.reduce((sum, item) => sum + toNumber(item.marketValue), 0)
  const totalProfit = rows.reduce((sum, item) => sum + toNumber(item.profit), 0)
  const totalCost = totalMarketValue - totalProfit
  const totalRate = totalCost === 0 ? 0 : totalProfit / totalCost

  let worst: HoldingMetrics | null = null
  for (const row of rows) {
    if (worst === null || toNumber(row.contribution) < toNumber(worst.contribution)) worst = row
  }

  return {
    totalMarketValue,
    totalProfit,
    totalRate,
    worst,
    worstWeight: worst ? toNumber(worst.weight) : 0,
    worstContribution: worst ? toNumber(worst.contribution) : 0,
    worstIsNegative: worst ? toNumber(worst.contribution) < 0 : false,
  }
}

export function healthScore(holdings: Holding[]): HealthReport {
  const rows = withMetrics(holdings)
  if (rows.length === 0) {
    return { score: 0, maxWeight: 0, lossRatio: 0, comment: '', deductions: [] }
  }

  const maxWeight = Math.max(...rows.map((item) => toNumber(item.weight)))
  const lossCount = rows.filter((item) => toNumber(item.profit) < 0).length
  const lossRatio = lossCount / rows.length

  let heaviest = rows[0]
  for (const row of rows) {
    if (toNumber(row.contribution) < toNumber(heaviest.contribution)) heaviest = row
  }

  const concentration = Math.min(30, Math.max(0, maxWeight - 0.3) * 1.5 * 100)
  const lossPoints = Math.min(25, lossRatio * 25)
  const contribution = toNumber(heaviest.contribution)
  const dragPoints = contribution < 0 ? Math.min(20, Math.abs(contribution) * 100 * 5) : 0

  const deductions: Deduction[] = [
    {
      dimension: '集中度',
      desc: `最大单一持仓占比 ${(maxWeight * 100).toFixed(1)}%${maxWeight > 0.3 ? '，超过 30% 阈值' : '，未超过 30% 阈值'}`,
      points: Math.round(concentration * 10) / 10,
    },
    {
      dimension: '亏损面',
      desc: `${lossCount} 只亏损，占持仓 ${(lossRatio * 100).toFixed(0)}%`,
      points: Math.round(lossPoints * 10) / 10,
    },
    {
      dimension: '拖累项',
      desc:
        contribution < 0
          ? `${heaviest.name} 收益贡献 ${(contribution * 100).toFixed(2)}%`
          : '最大拖累项收益贡献为正',
      points: Math.round(dragPoints * 10) / 10,
    },
  ]

  const total = deductions.reduce((sum, item) => sum + item.points, 0)
  const score = Math.max(0, Math.round((100 - total) * 10) / 10)

  let biggestLoser = rows[0]
  for (const row of rows) {
    if (toNumber(row.profit) < toNumber(biggestLoser.profit)) biggestLoser = row
  }

  const notes: string[] = []
  if (lossCount === 0) {
    notes.push('组合无亏损品种')
  } else {
    notes.push(`亏损最多的是${biggestLoser.name}，收益率 ${(toNumber(biggestLoser.rate) * 100).toFixed(2)}%`)
  }

  if (concentration > 0) {
    notes.push(`持仓集中度偏高，最大单一占比 ${(maxWeight * 100).toFixed(1)}%`)
    if (maxWeight > 0.5) notes.push('建议分散单一持仓')
  } else {
    notes.push('持仓分散度良好')
  }

  return { score, maxWeight, lossRatio, comment: `${notes.join('，')}。`, deductions }
}

export function liquidatedRate(holdings: Holding[], id: string): number {
  const rest = holdings.filter((item) => item.id !== id).filter(isValidHolding)
  const profit = rest.reduce((sum, item) => sum + toNumber(item.profit), 0)
  const cost = rest.reduce((sum, item) => sum + toNumber(item.marketValue), 0) - profit
  return cost === 0 ? 0 : profit / cost
}

export function worstLabel(isNegative: boolean): string {
  return isNegative ? '拖累最大' : '贡献最低'
}

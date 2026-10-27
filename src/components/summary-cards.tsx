import { Percent, TrendingUp, Wallet } from 'lucide-react'
import { formatMoney, formatRate } from '@/lib/format'
import type { PortfolioSummary } from '@/lib/portfolio'

interface SummaryCardsProps {
  summary: PortfolioSummary
  hasData: boolean
}

export function SummaryCards({ summary, hasData }: SummaryCardsProps) {
  const positive = summary.totalProfit >= 0
  const empty = !hasData

  const cards = [
    {
      label: '总市值',
      value: empty ? '—' : formatMoney(summary.totalMarketValue),
      suffix: empty ? '' : '元',
      icon: Wallet,
      tone: empty ? 'text-muted-foreground' : 'text-foreground',
    },
    {
      label: '总收益',
      value: empty ? '—' : formatMoney(summary.totalProfit),
      suffix: empty ? '' : '元',
      icon: TrendingUp,
      tone: empty ? 'text-muted-foreground' : positive ? 'text-profit' : 'text-loss',
    },
    {
      label: '总收益率',
      value: empty ? '—' : formatRate(summary.totalRate),
      suffix: '',
      icon: Percent,
      tone: empty ? 'text-muted-foreground' : positive ? 'text-profit' : 'text-loss',
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`mt-0.5 text-xl font-semibold tabular-nums ${card.tone}`}>
                {card.value}
                {card.suffix && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {card.suffix}
                  </span>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </section>
  )
}

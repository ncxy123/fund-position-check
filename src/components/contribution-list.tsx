import { CircleAlert } from 'lucide-react'
import { useState } from 'react'
import { ClientCardDialog } from '@/components/client-card-dialog'
import { Button } from '@/components/ui/button'
import { formatRate, formatSignedRate, toNumber } from '@/lib/format'
import {
  type Holding,
  type PortfolioSummary,
  liquidatedRate,
  withMetrics,
  worstLabel,
} from '@/lib/portfolio'

interface ContributionListProps {
  holdings: Holding[]
  summary: PortfolioSummary
}

export function ContributionList({ holdings, summary }: ContributionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rows = [...withMetrics(holdings)].sort(
    (a, b) => toNumber(a.contribution) - toNumber(b.contribution),
  )
  const maxAbs = Math.max(1e-4, ...rows.map((row) => Math.abs(toNumber(row.contribution))))
  const worst = summary.worst

  const note = worst
    ? `「${worst.name}」${worstLabel(summary.worstIsNegative)}，占组合 ${(
        summary.worstWeight * 100
      ).toFixed(1)}%，收益贡献 ${formatSignedRate(summary.worstContribution)}。`
    : '暂无持仓数据。'

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground">持仓明细与贡献分析</h2>
        <p className="mt-4 text-sm text-muted-foreground">请先填入持仓数据</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground text-balance">持仓明细与贡献分析</h2>
          <p className="mt-1 text-sm text-muted-foreground">按收益贡献从低到高排序</p>
        </div>
        <ClientCardDialog holdings={holdings} disabled={rows.length === 0} />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row) => {
          const negative = toNumber(row.contribution) < 0
          const width = Math.min(100, (Math.abs(toNumber(row.contribution)) / maxAbs) * 100)
          const expanded = expandedId === row.id

          return (
            <div key={row.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{row.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="tabular-nums">
                      收益率{' '}
                      <span className={negative ? 'text-loss' : 'text-profit'}>
                        {formatRate(row.rate)}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      收益贡献{' '}
                      <span className={negative ? 'text-loss' : 'text-profit'}>
                        {formatSignedRate(row.contribution)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-40 md:shrink-0">
                  <div className="flex h-2.5 w-full items-center justify-end overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${negative ? 'bg-loss' : 'bg-profit'}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                >
                  {expanded ? '收起' : '如果清仓'}
                </Button>
              </div>
              {expanded && (
                <div className="mt-3 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
                  若清仓「{row.name}」，剩余组合收益率为{' '}
                  <span className="font-semibold tabular-nums">
                    {formatRate(liquidatedRate(holdings, row.id))}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-pretty">{note}</p>
      </div>
    </section>
  )
}

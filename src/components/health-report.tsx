import { ShieldCheck } from 'lucide-react'
import type { HealthReport } from '@/lib/portfolio'

interface HealthScoreCardProps {
  health: HealthReport
  hasData: boolean
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-profit'
  if (score >= 60) return 'text-primary'
  return 'text-loss'
}

function barColor(score: number): string {
  if (score >= 80) return 'bg-profit'
  if (score >= 60) return 'bg-primary'
  return 'bg-loss'
}

export function HealthScoreCard({ health, hasData }: HealthScoreCardProps) {
  const { score, maxWeight, lossRatio, comment, deductions } = health
  const empty = !hasData

  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-card">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">组合体检分</h2>
      </div>

      <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex shrink-0 items-center gap-5">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-muted">
            <span
              className={`text-3xl font-bold tabular-nums ${
                empty ? 'text-muted-foreground' : scoreColor(score)
              }`}
            >
              {empty ? '—' : score}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>满分 100</p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {!empty && (
              <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${score}%` }} />
            )}
          </div>

          {!empty && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-background px-3 py-2">
                  <p className="text-muted-foreground">最大单一持仓占比</p>
                  <p className="mt-0.5 font-semibold tabular-nums text-foreground">
                    {(maxWeight * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-background px-3 py-2">
                  <p className="text-muted-foreground">亏损只数占比</p>
                  <p className="mt-0.5 font-semibold tabular-nums text-foreground">
                    {(lossRatio * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                {deductions.map((item) => (
                  <p key={item.dimension} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{item.dimension}</span>：
                    {item.desc}，−{item.points} 分
                  </p>
                ))}
              </div>

              <p className="mt-3 text-sm text-foreground text-pretty">{comment}</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

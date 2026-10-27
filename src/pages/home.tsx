import { Activity } from 'lucide-react'
import { ChatAssistant } from '@/components/chat-assistant'
import { ContributionList } from '@/components/contribution-list'
import { HealthScoreCard } from '@/components/health-report'
import { HoldingsEditor } from '@/components/holdings-editor'
import { SummaryCards } from '@/components/summary-cards'
import { useHoldings } from '@/hooks/use-holdings'
import { healthScore, summarize } from '@/lib/portfolio'

export function HomePage() {
  const [holdings, setHoldings] = useHoldings()
  const summary = summarize(holdings)
  const health = healthScore(holdings)
  const hasData = holdings.length > 0

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-10">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground md:text-2xl">基金持仓体检</h1>
              <p className="text-sm text-muted-foreground">上传持仓截图，一键分析组合健康度</p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          <HoldingsEditor holdings={holdings} onChange={setHoldings} />
          <SummaryCards summary={summary} hasData={hasData} />
          <ContributionList holdings={holdings} summary={summary} />
          <HealthScoreCard health={health} hasData={hasData} />
        </div>

        <footer className="mt-8 pb-28 text-center text-xs text-muted-foreground md:pb-8">
          仅供信息整理，不构成投资建议
        </footer>
      </div>

      <ChatAssistant holdings={holdings} />
    </div>
  )
}

import { Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { answerFromHoldings } from '@/lib/local-answer'
import { type Holding, withMetrics } from '@/lib/portfolio'
import { buildHoldingsText } from '@/lib/prompts'
import { askHoldingAssistant } from '@/services/ai'

interface ChatAssistantProps {
  holdings: Holding[]
}

interface Message {
  role: 'bot' | 'user'
  text: string
}

const SUGGESTIONS = ['我哪只基金最拖后腿', '我的持仓集中吗', '帮我写一段跟客户解释亏损的话']

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span className="whitespace-pre-wrap break-words text-pretty">
      {parts.map((part, index) =>
        /^\*\*[^*]+\*\*$/.test(part) ? (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={index}>{part.replace(/\*/g, '')}</Fragment>
        ),
      )}
    </span>
  )
}

export function ChatAssistant({ holdings }: ChatAssistantProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '您好，我是持仓助手，可以基于您的持仓表格回答问题。' },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const hasHoldings = withMetrics(holdings).length > 0

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, pending])

  const send = async (raw: string) => {
    const question = raw.trim()
    if (!question || pending || !hasHoldings) return

    const holdingsText = buildHoldingsText(holdings)
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setPending(true)

    try {
      const answer = await askHoldingAssistant(
        [
          ...messagesRef.current
            .slice(1)
            .map((item) => ({
              role: item.role === 'bot' ? ('assistant' as const) : ('user' as const),
              content: item.text,
            })),
          { role: 'user', content: question },
        ],
        holdingsText,
      )
      setMessages((prev) => [...prev, { role: 'bot', text: answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: answerFromHoldings(question, holdings) }])
    } finally {
      setPending(false)
    }
  }

  const showSuggestions = messages.length <= 1 && !pending

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[9998] bg-black/20" onClick={() => setOpen(false)} />
      )}

      <div
        className={`fixed bottom-24 right-6 z-[9999] w-[calc(100vw-2rem)] max-w-[360px] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-[120%]'
        }`}
      >
        <div
          className="flex h-[520px] max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-xl border border-border bg-card"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">持仓助手</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {hasHoldings ? (
              <div className="flex flex-col gap-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap break-words text-pretty">{message.text}</p>
                      ) : (
                        <RichText text={message.text} />
                      )}
                    </div>
                  </div>
                ))}

                {pending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      思考中…
                    </div>
                  </div>
                )}

                {showSuggestions && (
                  <div className="mt-2 flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">试试这些问题：</p>
                    {SUGGESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void send(question)}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <Bot className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground text-pretty">
                  请先上传截图，或点击「用示例数据」
                </p>
              </div>
            )}
          </div>

          {hasHoldings && (
            <div className="flex shrink-0 items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void send(input)
                }}
                placeholder="输入问题，回车发送…"
                disabled={pending}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full"
                disabled={pending || !input.trim()}
                onClick={() => void send(input)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-hover transition-transform hover:scale-105"
        aria-label="打开持仓助手"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  )
}

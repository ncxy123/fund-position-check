import { Copy, FileText, RefreshCw, WifiOff, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Holding } from '@/lib/portfolio'
import { generateClientCard } from '@/services/ai'

interface ClientCardDialogProps {
  holdings: Holding[]
  disabled?: boolean
}

export function ClientCardDialog({ holdings, disabled }: ClientCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [offline, setOffline] = useState(false)

  const generate = async () => {
    setOpen(true)
    setLoading(true)
    setText('')
    setOffline(false)
    try {
      const result = await generateClientCard(holdings)
      setText(result.text)
      setOffline(result.offline)
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪贴板')
    } catch {
      toast.error('复制失败，请手动选择文本')
    }
  }

  return (
    <>
      <Button size="sm" disabled={disabled} onClick={() => void generate()}>
        <FileText className="mr-1.5 h-4 w-4" />
        生成客户沟通卡
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              客户沟通卡
            </DialogTitle>
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="min-h-[160px] rounded-lg bg-muted/50 p-4">
            {loading ? (
              <p className="text-sm leading-relaxed text-muted-foreground">正在生成沟通文案…</p>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground text-pretty">
                {text}
              </p>
            )}
          </div>
          {offline && (
            <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>已使用离线话术，可重试生成</span>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => void generate()}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              重试生成
            </Button>
            <Button variant="outline" size="sm" disabled={!text} onClick={() => void copy()}>
              <Copy className="mr-1.5 h-4 w-4" />
              复制
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

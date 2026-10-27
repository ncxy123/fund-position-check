import { Image as ImageIcon, LoaderCircle, Plus, Sparkles, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toBase64 } from '@/lib/file'
import { createId } from '@/lib/id'
import { parseOcrRows } from '@/lib/ocr'
import type { Holding } from '@/lib/portfolio'
import { SAMPLE_HOLDINGS } from '@/lib/sample'
import { recognizeHoldings } from '@/services/ocr'

interface HoldingsEditorProps {
  holdings: Holding[]
  onChange: (holdings: Holding[]) => void
}

const EMPTY_ROW: Omit<Holding, 'id'> = { name: '', marketValue: null, profit: null }

export function HoldingsEditor({ holdings, onChange }: HoldingsEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [recognizing, setRecognizing] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.info('请上传图片文件（jpg/png）')
      return
    }

    setRecognizing(true)
    try {
      const image = await toBase64(file)
      const result = await recognizeHoldings(image)
      const rows = parseOcrRows(result ?? {})

      if (rows.length > 0) {
        onChange([...holdings, ...rows])
        toast.success(`识别到 ${rows.length} 行持仓，请核对并补充空缺项`)
      } else {
        onChange([...holdings, { ...EMPTY_ROW, id: createId() }])
        toast.info('未能自动识别，已新增空行，请手动填写')
      }
    } catch {
      onChange([...holdings, { ...EMPTY_ROW, id: createId() }])
      toast.info('识别失败，已新增空行，请手动填写')
    } finally {
      setRecognizing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleInput = (id: string, field: 'name' | 'marketValue' | 'profit', raw: string) => {
    onChange(
      holdings.map((item) => {
        if (item.id !== id) return item
        if (field === 'name') return { ...item, name: raw }
        const value = raw.trim() === '' ? null : Number(raw)
        return { ...item, [field]: Number.isFinite(value) ? value : null }
      }),
    )
  }

  const addRow = () => {
    onChange([...holdings, { ...EMPTY_ROW, id: createId() }])
  }

  const removeRow = (id: string) => {
    onChange(holdings.filter((item) => item.id !== id))
  }

  const loadSample = () => {
    onChange(SAMPLE_HOLDINGS.map((item) => ({ ...item, id: createId() })))
    toast.success('已载入示例持仓数据')
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground text-balance">上传持仓截图</h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            上传 jpg/png 截图自动识别，或直接填入数据
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleFile(file)
            }}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={recognizing}>
            {recognizing ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {recognizing ? '识别中…' : '上传截图'}
          </Button>
          <Button variant="secondary" onClick={loadSample}>
            <Sparkles className="mr-2 h-4 w-4" />
            用示例数据
          </Button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/60 text-left text-muted-foreground">
              <th className="whitespace-nowrap px-4 py-3 font-medium">基金名称</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">市值（元）</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">收益（元）</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  暂无数据，请上传截图或点击「用示例数据」
                </td>
              </tr>
            )}
            {holdings.map((holding) => (
              <tr key={holding.id} className="border-t border-border">
                <td className="px-4 py-2">
                  <Input
                    value={holding.name}
                    placeholder="基金名称"
                    onChange={(event) => handleInput(holding.id, 'name', event.target.value)}
                    className="px-2"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={holding.marketValue ?? ''}
                    placeholder="市值"
                    onChange={(event) => handleInput(holding.id, 'marketValue', event.target.value)}
                    className="px-2"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={holding.profit ?? ''}
                    placeholder="收益"
                    onChange={(event) => handleInput(holding.id, 'profit', event.target.value)}
                    className="px-2"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(holding.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-4 w-4" />
          新增一行
        </Button>
      </div>
    </section>
  )
}

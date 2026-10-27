import { createId } from './id'
import type { Holding } from './portfolio'

export interface OcrWord {
  words: string
}

export interface OcrResult {
  words_result?: OcrWord[]
}

const HEADER_PATTERN = /^(基金名称|基金代码|市值|收益|收益率|持仓|金额|名称|代码)/

export function parseAmount(raw: string): number | null {
  const normalized = raw.replace(/[,，¥￥元\s%]/g, '').replace(/[()（）]/g, '-')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export function parseOcrRows(result: OcrResult): Holding[] {
  const lines = (result.words_result ?? []).map((item) => item.words)
  const rows: Holding[] = []

  for (const line of lines) {
    if (!line || !line.trim()) continue

    const matched: string[] = line.match(/-?\d[\d,]*\.?\d*/g) ?? []
    const numbers = matched.map(parseAmount)
    let name = line
    let marketValue: number | null = null
    let profit: number | null = null

    if (numbers.length >= 2) {
      marketValue = numbers[numbers.length - 2]
      profit = numbers[numbers.length - 1]
      name = line
        .replace(matched[matched.length - 1], '')
        .replace(matched[matched.length - 2], '')
        .trim()
    } else if (numbers.length === 1) {
      marketValue = numbers[0]
      name = line.replace(matched[0], '').trim()
    }

    const isHeader = HEADER_PATTERN.test(name) && numbers.length === 0
    if (!isHeader && (name || marketValue !== null || profit !== null)) {
      rows.push({ id: createId(), name, marketValue, profit })
    }
  }

  return rows
}

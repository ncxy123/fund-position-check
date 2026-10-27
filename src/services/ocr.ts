import type { OcrResult } from '@/lib/ocr'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function recognizeHoldings(image: string): Promise<OcrResult> {
  const response = await fetch(`${API_BASE}/api/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, language_type: 'CHN_ENG' }),
  })

  if (!response.ok) throw new Error(`ocr request failed: ${response.status}`)

  return (await response.json()) as OcrResult
}

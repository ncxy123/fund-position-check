import { offlineClientCard } from '@/lib/local-answer'
import type { Holding } from '@/lib/portfolio'
import { buildHoldingsText, chatSystemPrompt, clientCardPrompt } from '@/lib/prompts'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const CARD_TIMEOUT = 10000

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ClientCardResult {
  text: string
  offline: boolean
}

async function postChat(messages: ChatMessage[], temperature: number): Promise<string> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature }),
  })

  if (!response.ok) throw new Error(`chat request failed: ${response.status}`)

  const data = (await response.json()) as { content?: string }
  const content = data.content?.trim()
  if (!content) throw new Error('empty chat response')

  return content
}

export function askHoldingAssistant(
  messages: ChatMessage[],
  holdingsText: string,
): Promise<string> {
  return postChat(
    [{ role: 'system', content: chatSystemPrompt(holdingsText) }, ...messages],
    0.3,
  )
}

export async function generateClientCard(holdings: Holding[]): Promise<ClientCardResult> {
  const prompt = clientCardPrompt(buildHoldingsText(holdings))
  const timeout = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('timeout')), CARD_TIMEOUT)
  })

  try {
    const text = await Promise.race([
      postChat([{ role: 'user', content: prompt }], 0.5),
      timeout,
    ])
    return { text, offline: false }
  } catch {
    return { text: offlineClientCard(holdings), offline: true }
  }
}

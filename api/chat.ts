const BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1'
const API_KEY = process.env.AI_API_KEY || ''
const MODEL = process.env.AI_MODEL || 'gpt-4o-mini'

interface ChatRequestBody {
  messages?: { role: string; content: unknown }[]
  temperature?: number
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const body = (req.body ?? {}) as ChatRequestBody
  const messages = body.messages

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages is required' })
    return
  }

  if (!API_KEY) {
    res.status(500).json({ error: 'AI_API_KEY is not configured' })
    return
  }

  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: body.temperature ?? 0.3,
      }),
    })

    if (!upstream.ok) {
      res.status(502).json({ error: `upstream responded ${upstream.status}` })
      return
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[]
    }

    res.status(200).json({ content: data.choices?.[0]?.message?.content ?? '' })
  } catch {
    res.status(500).json({ error: 'request failed' })
  }
}

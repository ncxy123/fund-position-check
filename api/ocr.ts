const BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1'
const API_KEY = process.env.AI_API_KEY || ''
const MODEL = process.env.AI_VISION_MODEL || 'gpt-4o-mini'

const INSTRUCTION =
  '请识别这张基金持仓截图里的文字，逐行输出，每行一条，保留原始的数字和小数点，不要输出表头，不要添加任何解释或标点。'

interface OcrRequestBody {
  image?: string
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const body = (req.body ?? {}) as OcrRequestBody

  if (!body.image) {
    res.status(400).json({ error: 'image is required' })
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
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: INSTRUCTION },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${body.image}` } },
            ],
          },
        ],
      }),
    })

    if (!upstream.ok) {
      res.status(502).json({ error: `upstream responded ${upstream.status}` })
      return
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[]
    }

    const content = data.choices?.[0]?.message?.content ?? ''
    const words = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ words: line }))

    res.status(200).json({ words_result: words })
  } catch {
    res.status(500).json({ error: 'request failed' })
  }
}

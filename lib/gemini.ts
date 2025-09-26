import { GoogleGenerativeAI } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
    if (!key) throw new Error('Missing GOOGLE_GEMINI_API_KEY')
    _client = new GoogleGenerativeAI(key)
  }
  return _client
}

export function getModel(model = process.env.GEMINI_MODEL || 'gemini-1.5-flash') {
  const client = getGeminiClient()
  return client.getGenerativeModel({ model })
}

export async function generateJSON(prompt: string, schemaDescription: string): Promise<any> {
  const model = getModel()
  const system = `You are an assistant that generates STRICT JSON only. No prose. Do not include markdown.
Output MUST be valid JSON conforming to the provided schema.`
  const fullPrompt = `${system}\n\nSchema:\n${schemaDescription}\n\nUser request:\n${prompt}`

  const result = await model.generateContent(fullPrompt)
  const text = result.response.text()

  // Try to parse; if wrapped in code fences, strip them
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/i, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch (err) {
    // Best-effort: attempt to find first JSON block
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      const slice = cleaned.slice(start, end + 1)
      return JSON.parse(slice)
    }
    throw new Error('Failed to parse JSON from Gemini response')
  }
}


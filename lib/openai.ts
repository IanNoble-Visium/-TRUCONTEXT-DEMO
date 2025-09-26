import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY || ''
    if (!key) throw new Error('Missing OPENAI_API_KEY')
    _client = new OpenAI({ apiKey: key })
  }
  return _client
}

export async function generateJSON(prompt: string, schemaDescription: string): Promise<any> {
  const client = getOpenAIClient()
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const system = `You are an assistant that generates STRICT JSON only. No prose. Do not include markdown.
Output MUST be valid JSON conforming to the provided schema.`

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Schema:\n${schemaDescription}\n\nUser request:\n${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const text = response.choices[0]?.message?.content || ''

    try {
      return JSON.parse(text)
    } catch (err) {
      // Best-effort: attempt to find first JSON block
      const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/i, '').trim()
      const start = cleaned.indexOf('{')
      const end = cleaned.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        const slice = cleaned.slice(start, end + 1)
        return JSON.parse(slice)
      }
      throw new Error('Failed to parse JSON from OpenAI response')
    }
  } catch (error: any) {
    // Enhanced error handling for OpenAI-specific errors
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local and ensure billing is set up on your OpenAI account.')
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later or upgrade your plan.')
    } else if (error.status === 403) {
      throw new Error('OpenAI API access forbidden. Please check your account permissions and billing status.')
    } else if (error.status === 404) {
      throw new Error(`OpenAI model "${model}" not found. Please check your OPENAI_MODEL setting.`)
    } else {
      throw new Error(`OpenAI API error: ${error.message}`)
    }
  }
}

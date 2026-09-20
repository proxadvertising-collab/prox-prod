import { NextResponse } from 'next/server'

// Talk to an Ollama-compatible /api/generate endpoint.
// Configure with env vars; defaults preserve local dev behavior.
// In production, point OLLAMA_BASE_URL at the reachable Ollama host
// (e.g. the Mac mini over Tailscale) — never hardcode a host here.
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest'

export async function POST(req: Request) {
  try {
    const { input } = await req.json()
    if (!input) {
      return NextResponse.json({ error: 'Missing input' }, { status: 400 })
    }

    const prompt = `6-8 word catchy deal title for: ${input}`

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Ollama generation failed')
    }

    const data = await response.json()
    const title = data.response?.trim() || 'Special Offer Available'

    return NextResponse.json({ title })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Generation error' }, { status: 500 })
  }
}

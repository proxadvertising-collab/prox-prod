import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { input } = await req.json()
    if (!input) {
      return NextResponse.json({ error: 'Missing input' }, { status: 400 })
    }

    const prompt = `6-8 word catchy deal title for: ${input}`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:latest',
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

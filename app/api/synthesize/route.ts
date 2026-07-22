import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { text: rawText, voiceId } = await request.json()
    if (!rawText) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }
    const text = rawText.length > 800 ? rawText.substring(0, 800) : rawText
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY!,
    })
    const audioStream = await client.textToSpeech.convert(
      voiceId || process.env.ELEVENLABS_VOICE_ID!,
      {
        text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      }
    )
    const reader = (audioStream as ReadableStream<Uint8Array>).getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const audioBuffer = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset)
      offset += chunk.length
    }

    const blob = await put(`dubbed-audio-${Date.now()}.mp3`, Buffer.from(audioBuffer), {
      access: 'public',
      contentType: 'audio/mpeg',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Voice synthesis error:', error)
    return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 })
  }
}

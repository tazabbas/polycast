import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY!,
    })

    const audioStream = await client.textToSpeech.convert(
      process.env.ELEVENLABS_VOICE_ID!,
      {
        text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      }
    )

    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk))
    }
    const audioBuffer = Buffer.concat(chunks)

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Voice synthesis error:', error)
    return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 })
  }
}

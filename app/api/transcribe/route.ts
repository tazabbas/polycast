import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()
    if (!videoUrl) {
      return NextResponse.json({ error: 'No video URL provided' }, { status: 400 })
    }

    const fileRes = await fetch(videoUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Could not fetch uploaded file' }, { status: 400 })
    }
    const arrayBuffer = await fileRes.arrayBuffer()
    const contentType = fileRes.headers.get('content-type') || 'video/mp4'
    const file = new File([arrayBuffer], 'upload', { type: contentType })

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    })

    return NextResponse.json({ transcript: transcription.text })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}

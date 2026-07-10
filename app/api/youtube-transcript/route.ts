import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'No videoId provided' }, { status: 400 })
    }

    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)

    if (!transcriptItems || transcriptItems.length === 0) {
      return NextResponse.json({ error: 'No transcript found for this video' }, { status: 404 })
    }

    const transcript = transcriptItems
      .map((item) => item.text)
      .join(' ')
      .replace(/\[.*?\]/g, '')
      .trim()

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Transcript fetch error:', error)
    return NextResponse.json({ error: 'Could not fetch transcript for this video' }, { status: 500 })
  }
}

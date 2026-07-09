import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'No videoId provided' }, { status: 400 })
    }

    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
    )

    const html = await response.text()

    const captionMatch = html.match(/"captionTracks":\[(.*?)\]/)
    if (!captionMatch) {
      return NextResponse.json({ error: 'No captions found for this video' }, { status: 404 })
    }

    const captionData = JSON.parse(`[${captionMatch[1]}]`)
    const englishTrack = captionData.find((t: {languageCode: string, baseUrl: string}) =>
      t.languageCode === 'en' || t.languageCode === 'en-US'
    ) || captionData[0]

    if (!englishTrack?.baseUrl) {
      return NextResponse.json({ error: 'No usable caption track found' }, { status: 404 })
    }

    const captionResponse = await fetch(englishTrack.baseUrl)
    const captionXml = await captionResponse.text()

    const textMatches = captionXml.match(/<text[^>]*>(.*?)<\/text>/g) || []
    const transcript = textMatches
      .map(t => t.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
      .join(' ')
      .trim()

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Transcript fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
  }
}
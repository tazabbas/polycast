import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()
    if (!youtubeUrl || !ytdl.validateURL(youtubeUrl)) {
      return NextResponse.json({ error: 'That doesn\'t look like a valid YouTube URL' }, { status: 400 })
    }

    const info = await ytdl.getInfo(youtubeUrl)
    const title = info.videoDetails.title

    const format = ytdl.chooseFormat(info.formats, { quality: '18' })

    const chunks: Uint8Array[] = []
    await new Promise<void>((resolve, reject) => {
      const stream = ytdl.downloadFromInfo(info, { format })
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve())
      stream.on('error', (err) => reject(err))
    })

    const buffer = Buffer.concat(chunks)

    const blob = await put(`youtube-${Date.now()}.mp4`, buffer, {
      access: 'public',
      contentType: 'video/mp4',
    })

    return NextResponse.json({ videoUrl: blob.url, title })
  } catch (error) {
    console.error('YouTube fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch that video. It may be private, age-restricted, or unavailable.' },
      { status: 500 }
    )
  }
}

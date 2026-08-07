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
      {
        error:
          "Couldn't fetch this video automatically — it's likely set to Private on YouTube. " +
          "Private videos can't be auto-fetched by any tool, even for their own owner, since YouTube doesn't provide a way to download them via the API. " +
          "To use it: either switch it to Public or Unlisted in YouTube Studio and try again, or download it yourself from YouTube Studio and use the Upload file tab instead.",
      },
      { status: 500 }
    )
  }
}

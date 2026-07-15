import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoUrl, audioUrl } = await request.json()

    if (!videoUrl || !audioUrl) {
      return NextResponse.json({ error: 'Both video and audio URLs are required' }, { status: 400 })
    }

    const syncRes = await fetch('https://api.sync.so/v2/generate', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.SYNC_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'lipsync-2',
        input: [
          { type: 'video', url: videoUrl },
          { type: 'audio', url: audioUrl },
        ],
        options: {
          sync_mode: 'cut_off',
        },
      }),
    })

    const data = await syncRes.json()

    if (!syncRes.ok) {
      console.error('Sync Labs error:', data)
      return NextResponse.json({ error: data.error || 'Lip sync generation failed to start' }, { status: syncRes.status })
    }

    return NextResponse.json({ id: data.id, status: data.status })
  } catch (error) {
    console.error('Lip sync error:', error)
    return NextResponse.json({ error: 'Failed to start lip sync generation' }, { status: 500 })
  }
}

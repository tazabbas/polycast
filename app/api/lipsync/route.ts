import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const videoFile = formData.get('video') as File | null
    const audioFile = formData.get('audio') as File | null

    if (!videoFile || !audioFile) {
      return NextResponse.json({ error: 'Both video and audio files are required' }, { status: 400 })
    }

    const MAX_SIZE = 20 * 1024 * 1024 // 20MB — Sync Labs direct upload limit
    if (videoFile.size > MAX_SIZE || audioFile.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Files must be under 20MB for lip sync' }, { status: 400 })
    }

    const syncFormData = new FormData()
    syncFormData.append('video', videoFile)
    syncFormData.append('audio', audioFile)
    syncFormData.append('model', 'lipsync-2')

    const syncRes = await fetch('https://api.sync.so/v2/generate', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.SYNC_API_KEY!,
      },
      body: syncFormData,
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

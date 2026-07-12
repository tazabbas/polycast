import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing generation id' }, { status: 400 })
    }

    const syncRes = await fetch(`https://api.sync.so/v2/generate/${id}`, {
      headers: {
        'x-api-key': process.env.SYNC_API_KEY!,
      },
    })

    const data = await syncRes.json()

    if (!syncRes.ok) {
      console.error('Sync Labs status error:', data)
      return NextResponse.json({ error: data.error || 'Failed to check status' }, { status: syncRes.status })
    }

    return NextResponse.json({
      status: data.status,
      outputUrl: data.outputUrl || null,
      error: data.error || null,
    })
  } catch (error) {
    console.error('Lip sync status error:', error)
    return NextResponse.json({ error: 'Failed to check lip sync status' }, { status: 500 })
  }
}

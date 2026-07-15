import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoUrl, audioUrl, durationSeconds } = await request.json()

    if (!videoUrl || !audioUrl || !durationSeconds) {
      return NextResponse.json({ error: 'Video URL, audio URL, and duration are required' }, { status: 400 })
    }

    const minutesNeeded = Math.ceil(durationSeconds / 60)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: credits } = await supabase
      .from('user_credits')
      .select('minutes_balance')
      .eq('user_id', userId)
      .single()

    const currentBalance = credits?.minutes_balance || 0

    if (currentBalance < minutesNeeded) {
      return NextResponse.json(
        { error: `Not enough lip sync credits. This needs ${minutesNeeded} min but you have ${currentBalance} min. Buy more credits on the pricing page.` },
        { status: 402 }
      )
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

    await supabase.from('lipsync_jobs').insert({
      id: data.id,
      user_id: userId,
      minutes_estimated: minutesNeeded,
    })

    return NextResponse.json({ id: data.id, status: data.status })
  } catch (error) {
    console.error('Lip sync error:', error)
    return NextResponse.json({ error: 'Failed to start lip sync generation' }, { status: 500 })
  }
}

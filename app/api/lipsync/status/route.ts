import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

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

    if (data.status === 'COMPLETED') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: job } = await supabase
        .from('lipsync_jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (job && !job.deducted) {
        const { data: credits } = await supabase
          .from('user_credits')
          .select('minutes_balance')
          .eq('user_id', job.user_id)
          .single()

        const newBalance = Math.max(0, (credits?.minutes_balance || 0) - job.minutes_estimated)

        await supabase
          .from('user_credits')
          .update({ minutes_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('user_id', job.user_id)

        await supabase
          .from('lipsync_jobs')
          .update({ deducted: true })
          .eq('id', id)
      }
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

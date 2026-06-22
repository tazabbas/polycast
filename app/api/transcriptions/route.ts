import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { file_name, transcript } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('transcriptions')
      .insert({ user_id: userId, file_name, transcript })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ transcription: data })
  } catch (error) {
    console.error('Save transcription error:', error)
    return NextResponse.json({ error: 'Failed to save transcription' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('transcriptions')
      .select('*, translations(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ transcriptions: data })
  } catch (error) {
    console.error('Get transcriptions error:', error)
    return NextResponse.json({ error: 'Failed to get transcriptions' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

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
      .from('voices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ voices: data })
  } catch (error) {
    console.error('List voices error:', error)
    return NextResponse.json({ error: 'Failed to load voices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { audioUrl, name } = await request.json()
    if (!audioUrl || !name) {
      return NextResponse.json({ error: 'Audio sample and name are required' }, { status: 400 })
    }

    const fileRes = await fetch(audioUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Could not fetch audio sample' }, { status: 400 })
    }
    const arrayBuffer = await fileRes.arrayBuffer()
    const contentType = fileRes.headers.get('content-type') || 'audio/mpeg'
    const file = new File([arrayBuffer], 'sample.mp3', { type: contentType })

    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY!,
    })

    const voice = await client.voices.ivc.create({
      name,
      files: [file],
    })

    const voiceId = (voice as { voiceId?: string; voice_id?: string }).voiceId
      || (voice as { voiceId?: string; voice_id?: string }).voice_id

    if (!voiceId) {
      return NextResponse.json({ error: 'Voice created but no ID returned' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase.from('voices').insert({ id: voiceId, user_id: userId, name })

    return NextResponse.json({ id: voiceId, name })
  } catch (error) {
    console.error('Voice creation error:', error)
    return NextResponse.json({ error: 'Failed to create voice clone' }, { status: 500 })
  }
}

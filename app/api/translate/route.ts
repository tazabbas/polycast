import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import * as deepl from 'deepl-node'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, target_language, transcription_id } = await request.json()

    const translator = new deepl.Translator(process.env.DEEPL_API_KEY!)

    const result = await translator.translateText(
      text,
      null,
      target_language as deepl.TargetLanguageCode
    )

    const translated_text = Array.isArray(result) ? result[0].text : result.text

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase
        .from('translations')
        .insert({ user_id: userId, transcription_id, target_language, translated_text })
    } catch (dbError) {
      console.error('DB save failed (non-fatal):', dbError)
    }

    return NextResponse.json({ translated_text })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
const { data, error } = await supabase
  .from('translations')
  .insert({ user_id: userId, transcription_id, target_language, translated_text })
  .select()
  .single()

if (error) throw error

return NextResponse.json({ translation: data, translated_text })
try {
  await supabase
    .from('translations')
    .insert({ user_id: userId, transcription_id, target_language, translated_text })
} catch (dbError) {
  console.error('DB save failed (non-fatal):', dbError)
}

return NextResponse.json({ translated_text })

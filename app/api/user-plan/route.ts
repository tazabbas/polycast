import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Developer override: the app owner always has full Pro-level access for testing,
  // regardless of what's actually stored in the database.
  if (process.env.ADMIN_USER_ID && userId === process.env.ADMIN_USER_ID) {
    return NextResponse.json({ plan: 'pro' })
  }

  const { data } = await supabase
    .from('user_credits')
    .select('plan')
    .eq('user_id', userId)
    .single()

  return NextResponse.json({ plan: data?.plan || null })
}

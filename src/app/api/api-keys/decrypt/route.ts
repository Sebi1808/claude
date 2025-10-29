import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { decryptAPIKey } from '@/lib/encryption-server'
import type { Database } from '@/types/database'
import type { LLMProvider } from '@/types/storycheck'

// POST - Decrypt an API key for the current user
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider ist erforderlich' },
        { status: 400 }
      )
    }

    // Fetch the encrypted API key for this provider
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key, is_active')
      .eq('user_id', user.id)
      .eq('provider', provider as LLMProvider)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: `Kein aktiver API-Key für ${provider} gefunden` },
        { status: 404 }
      )
    }

    // Decrypt the API key
    const decryptedKey = decryptAPIKey(data.encrypted_key)

    // Update last_used_at timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', provider as LLMProvider)

    return NextResponse.json({ apiKey: decryptedKey })
  } catch (error: any) {
    console.error('API key decrypt error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decrypt API key' },
      { status: 500 }
    )
  }
}

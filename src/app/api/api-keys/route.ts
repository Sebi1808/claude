import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { encryptAPIKey, validateAPIKey, getKeyLastFour } from '@/lib/encryption-server'
import type { Database } from '@/types/database'

// GET - List all API keys for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, provider, key_last_four, is_active, created_at, last_used_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('API keys GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add a new API key
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

    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider und API-Key sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate API key format
    const validation = validateAPIKey(provider, apiKey)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Ungültiger API-Key' },
        { status: 400 }
      )
    }

    // Encrypt the API key
    const encryptedKey = encryptAPIKey(apiKey)
    const lastFour = getKeyLastFour(apiKey)

    // Check if user already has a key for this provider
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single()

    if (existing) {
      // Update existing key
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({
          encrypted_key: encryptedKey,
          key_last_four: lastFour,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating API key:', updateError)
        return NextResponse.json(
          { error: 'Failed to update API key' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'API-Key aktualisiert',
        id: existing.id,
      })
    } else {
      // Insert new key
      const { data, error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          provider,
          encrypted_key: encryptedKey,
          key_last_four: lastFour,
          is_active: true,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Error inserting API key:', insertError)
        return NextResponse.json(
          { error: 'Failed to add API key' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'API-Key hinzugefügt', id: data.id })
    }
  } catch (error: any) {
    console.error('API keys POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update an API key (e.g., toggle active status)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyId, isActive } = await request.json()

    if (!keyId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Key ID und isActive sind erforderlich' },
        { status: 400 }
      )
    }

    // Verify ownership before updating
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ is_active: isActive })
      .eq('id', keyId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating API key:', updateError)
      return NextResponse.json(
        { error: 'Failed to update API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'API-Key aktualisiert' })
  } catch (error: any) {
    console.error('API keys PATCH error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID erforderlich' }, { status: 400 })
    }

    // Verify ownership before deleting
    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting API key:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'API-Key gelöscht' })
  } catch (error: any) {
    console.error('API keys DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

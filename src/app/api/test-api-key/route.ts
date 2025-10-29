import { NextRequest, NextResponse } from 'next/server'
import type { LLMProvider } from '@/types/storycheck'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { provider, apiKey } = body

    if (!provider || !apiKey) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Provider und API-Key sind erforderlich' 
        },
        { status: 400 }
      )
    }

    // Test the API key based on provider
    const result = await testAPIKey(provider, apiKey)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API key test error:', error)
    return NextResponse.json(
      { 
        valid: false,
        error: error.message || 'Fehler beim Testen des API-Keys' 
      },
      { status: 500 }
    )
  }
}

async function testAPIKey(
  provider: LLMProvider,
  apiKey: string
): Promise<{ valid: boolean; error?: string; info?: any }> {
  switch (provider) {
    case 'claude':
      return testClaudeKey(apiKey)
    case 'openai':
      return testOpenAIKey(apiKey)
    case 'gemini':
      return testGeminiKey(apiKey)
    default:
      return { valid: false, error: 'Unbekannter Provider' }
  }
}

async function testClaudeKey(apiKey: string) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })

    if (response.ok) {
      return { valid: true, info: { provider: 'Claude', status: 'OK' } }
    }

    const error = await response.json()
    return {
      valid: false,
      error: error.error?.message || 'Ungültiger API-Key',
    }
  } catch (error: any) {
    return { valid: false, error: error.message || 'Netzwerkfehler' }
  }
}

async function testOpenAIKey(apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        valid: true,
        info: {
          provider: 'OpenAI',
          status: 'OK',
          models: data.data?.length || 0,
        },
      }
    }

    const error = await response.json()
    return {
      valid: false,
      error: error.error?.message || 'Ungültiger API-Key',
    }
  } catch (error: any) {
    return { valid: false, error: error.message || 'Netzwerkfehler' }
  }
}

async function testGeminiKey(apiKey: string) {
  try {
    // Test by listing models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
      }
    )

    if (response.ok) {
      const data = await response.json()
      return {
        valid: true,
        info: {
          provider: 'Gemini',
          status: 'OK',
          models: data.models?.length || 0,
        },
      }
    }

    const error = await response.json()
    return {
      valid: false,
      error: error.error?.message || 'Ungültiger API-Key',
    }
  } catch (error: any) {
    return { valid: false, error: error.message || 'Netzwerkfehler' }
  }
}

// ============================================
// LLM PROVIDER INTEGRATION
// Handles API calls to Claude, OpenAI, and Gemini
// ============================================

import type { LLMProvider, LLMModel, ClaudeModel, OpenAIModel, GeminiModel } from '@/types/storycheck'

export interface LLMResponse {
  content: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
  error?: string
}

/**
 * Main function to call any LLM provider
 */
export async function callLLM(
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  try {
    switch (provider) {
      case 'claude':
        return await callClaude(model as ClaudeModel, apiKey, prompt, systemPrompt)
      case 'openai':
        return await callOpenAI(model as OpenAIModel, apiKey, prompt, systemPrompt)
      case 'gemini':
        return await callGemini(model as GeminiModel, apiKey, prompt, systemPrompt)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  } catch (error) {
    console.error('LLM call error:', error)
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Call Anthropic Claude API
 */
async function callClaude(
  model: ClaudeModel,
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt || 'Du bist ein Experte für demokratisches Storytelling und hilfst bei der Analyse von Social Media Posts.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(errorData.error?.message || `Claude API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    content: data.content[0].text,
    usage: {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens
    }
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  model: OpenAIModel,
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'Du bist ein Experte für demokratisches Storytelling und hilfst bei der Analyse von Social Media Posts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0].message.content,
    usage: {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens
    }
  }
}

/**
 * Call Google Gemini API
 */
async function callGemini(
  model: GeminiModel,
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<LLMResponse> {
  // Combine system prompt with user prompt for Gemini
  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${prompt}`
    : prompt

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.candidates || !data.candidates[0]) {
    throw new Error('No response from Gemini')
  }

  return {
    content: data.candidates[0].content.parts[0].text,
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0
    }
  }
}

/**
 * Call Vision-capable LLM for image analysis
 */
export async function callVisionLLM(
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string,
  prompt: string,
  imageBase64: string,
  imageType: string = 'image/jpeg'
): Promise<LLMResponse> {
  try {
    switch (provider) {
      case 'claude':
        return await callClaudeVision(model as ClaudeModel, apiKey, prompt, imageBase64, imageType)
      case 'openai':
        return await callOpenAIVision(model as OpenAIModel, apiKey, prompt, imageBase64)
      case 'gemini':
        return await callGeminiVision(model as GeminiModel, apiKey, prompt, imageBase64, imageType)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  } catch (error) {
    console.error('Vision LLM call error:', error)
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Call Claude with vision
 */
async function callClaudeVision(
  model: ClaudeModel,
  apiKey: string,
  prompt: string,
  imageBase64: string,
  imageType: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageType,
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(errorData.error?.message || `Claude Vision API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    content: data.content[0].text,
    usage: {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens
    }
  }
}

/**
 * Call OpenAI with vision
 */
async function callOpenAIVision(
  model: OpenAIModel,
  apiKey: string,
  prompt: string,
  imageBase64: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(errorData.error?.message || `OpenAI Vision API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0].message.content,
    usage: {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens
    }
  }
}

/**
 * Call Gemini with vision
 */
async function callGeminiVision(
  model: GeminiModel,
  apiKey: string,
  prompt: string,
  imageBase64: string,
  imageType: string
): Promise<LLMResponse> {
  // Extract mime type
  const mimeType = imageType

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(errorData.error?.message || `Gemini Vision API error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.candidates || !data.candidates[0]) {
    throw new Error('No response from Gemini Vision')
  }

  return {
    content: data.candidates[0].content.parts[0].text,
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0
    }
  }
}

/**
 * Test API key validity
 */
export async function testAPIKey(
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await callLLM(
      provider,
      model,
      apiKey,
      'Antworte nur mit "OK"',
      'Du bist ein Test-Bot. Antworte immer nur mit "OK".'
    )

    if (response.error) {
      return { valid: false, error: response.error }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

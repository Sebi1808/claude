// ============================================
// API-KEY ENCRYPTION UTILITY
// Client-side encryption before sending to database
// ============================================

/**
 * Encrypt an API key before storing
 * Uses Web Crypto API (browser-safe)
 */
export async function encryptAPIKey(apiKey: string, masterKey?: string): Promise<string> {
  // In production, use a user-specific encryption key
  // For now, we'll use a simple encoding (THIS IS NOT SECURE FOR PRODUCTION!)
  // In real implementation, this should use proper encryption

  // TODO: Implement proper AES-GCM encryption with Web Crypto API
  // For now, just base64 encode (NOT SECURE - PLACEHOLDER ONLY!)

  const encoded = btoa(apiKey)
  return encoded
}

/**
 * Decrypt an API key after retrieving from database
 */
export async function decryptAPIKey(encryptedKey: string, masterKey?: string): Promise<string> {
  // TODO: Implement proper decryption
  // For now, just base64 decode

  try {
    const decoded = atob(encryptedKey)
    return decoded
  } catch (error) {
    console.error('Decryption error:', error)
    return ''
  }
}

/**
 * Get last 4 characters of API key for display
 */
export function getKeyLastFour(apiKey: string): string {
  if (apiKey.length < 4) return apiKey
  return apiKey.slice(-4)
}

/**
 * Mask API key for display (e.g., "sk-ant-...j7Kx")
 */
export function maskAPIKey(apiKey: string): string {
  if (apiKey.length < 12) return apiKey

  const prefix = apiKey.slice(0, 7) // e.g., "sk-ant-"
  const suffix = apiKey.slice(-4)    // last 4 chars

  return `${prefix}...${suffix}`
}

/**
 * Validate API key format
 */
export function validateAPIKey(provider: string, apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API-Key darf nicht leer sein' }
  }

  switch (provider) {
    case 'claude':
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, error: 'Claude API-Key muss mit "sk-ant-" beginnen' }
      }
      if (apiKey.length < 20) {
        return { valid: false, error: 'Claude API-Key ist zu kurz' }
      }
      break

    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, error: 'OpenAI API-Key muss mit "sk-" beginnen' }
      }
      if (apiKey.length < 20) {
        return { valid: false, error: 'OpenAI API-Key ist zu kurz' }
      }
      break

    case 'gemini':
      // Gemini keys have different format
      if (apiKey.length < 20) {
        return { valid: false, error: 'Gemini API-Key ist zu kurz' }
      }
      break

    default:
      return { valid: false, error: 'Unbekannter Provider' }
  }

  return { valid: true }
}

// ============================================
// PRODUCTION-READY ENCRYPTION (Web Crypto API)
// TODO: Uncomment and use in production
// ============================================

/*
async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function encryptAPIKeySecure(apiKey: string, password: string): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('storycheck-democracy-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(apiKey)
  )

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

export async function decryptAPIKeySecure(encryptedData: string, password: string): Promise<string> {
  const enc = new TextEncoder()
  const dec = new TextDecoder()

  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('storycheck-democracy-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  )

  return dec.decode(decrypted)
}
*/

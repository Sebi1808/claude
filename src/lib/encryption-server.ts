// ============================================
// SERVER-SIDE API-KEY ENCRYPTION UTILITY
// Uses Node.js crypto module for AES-256-GCM
// ============================================

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

/**
 * Get the master encryption key from environment
 * Falls back to a default key (not secure for production!)
 */
function getMasterKey(): Buffer {
  const keyHex = process.env.API_KEYS_ENCRYPTION_KEY

  if (!keyHex) {
    console.warn(
      'WARNING: API_KEYS_ENCRYPTION_KEY not set! Using insecure default key.'
    )
    // Default key (32 bytes for AES-256)
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex')
  }

  // Ensure key is 32 bytes (64 hex characters)
  const keyBuffer = Buffer.from(keyHex, 'hex')
  if (keyBuffer.length !== 32) {
    throw new Error('API_KEYS_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }

  return keyBuffer
}

/**
 * Encrypt an API key using AES-256-GCM
 * Returns: base64(iv + authTag + ciphertext)
 */
export function encryptAPIKey(apiKey: string): string {
  try {
    const key = getMasterKey()
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(apiKey, 'utf8')
    encrypted = Buffer.concat([encrypted, cipher.final()])

    const authTag = cipher.getAuthTag()

    // Combine: IV + AuthTag + Encrypted data
    const combined = Buffer.concat([iv, authTag, encrypted])

    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt API key')
  }
}

/**
 * Decrypt an API key using AES-256-GCM
 */
export function decryptAPIKey(encryptedData: string): string {
  try {
    const key = getMasterKey()
    const combined = Buffer.from(encryptedData, 'base64')

    // Extract: IV + AuthTag + Encrypted data
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt API key')
  }
}

/**
 * Validate API key format before encryption
 */
export function validateAPIKey(
  provider: string,
  apiKey: string
): { valid: boolean; error?: string } {
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
      if (apiKey.length < 20) {
        return { valid: false, error: 'Gemini API-Key ist zu kurz' }
      }
      break

    default:
      return { valid: false, error: 'Unbekannter Provider' }
  }

  return { valid: true }
}

/**
 * Get last 4 characters of API key for display
 */
export function getKeyLastFour(apiKey: string): string {
  if (apiKey.length < 4) return apiKey
  return apiKey.slice(-4)
}

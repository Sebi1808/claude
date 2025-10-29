'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Key, Plus, Trash2, Check, X, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { validateAPIKey } from '@/lib/encryption'
import type { LLMProvider } from '@/types/storycheck'

interface APIKey {
  id: string
  provider: LLMProvider
  key_last_four: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

export default function APIKeysPage() {
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Load API keys on mount
  useEffect(() => {
    loadAPIKeys()
  }, [])

  const loadAPIKeys = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setApiKeys(data || [])
    } catch (err: any) {
      console.error('Error loading API keys:', err)
      setError(err.message || 'Fehler beim Laden der API-Keys')
    } finally {
      setLoading(false)
    }
  }

  const handleAddKey = async (provider: LLMProvider, apiKey: string) => {
    try {
      setError(null)

      // Validate API key format on client
      const validation = validateAPIKey(provider, apiKey)
      if (!validation.valid) {
        setError(validation.error || 'Ungültiger API-Key')
        return
      }

      // Send to API route for server-side encryption
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, apiKey }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Hinzufügen des API-Keys')
      }

      // Reload keys
      await loadAPIKeys()
      setShowAddForm(false)
    } catch (err: any) {
      console.error('Error adding API key:', err)
      setError(err.message || 'Fehler beim Hinzufügen des API-Keys')
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('API-Key wirklich löschen?')) return

    try {
      setError(null)

      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Löschen des API-Keys')
      }

      // Reload keys
      await loadAPIKeys()
    } catch (err: any) {
      console.error('Error deleting API key:', err)
      setError(err.message || 'Fehler beim Löschen des API-Keys')
    }
  }

  const handleToggleActive = async (keyId: string, currentActive: boolean) => {
    try {
      setError(null)

      const response = await fetch('/api/api-keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId, isActive: !currentActive }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Aktualisieren des API-Keys')
      }

      // Reload keys
      await loadAPIKeys()
    } catch (err: any) {
      console.error('Error toggling API key:', err)
      setError(err.message || 'Fehler beim Aktualisieren des API-Keys')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">API-Keys</h1>
                <p className="text-sm text-gray-600">Verwalten Sie Ihre LLM API-Keys</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Zurück
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <X className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800">Fehler</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              BYOK - Bring Your Own Keys
            </h3>
            <p className="text-blue-700 text-sm">
              StoryCheck Democracy verwendet Ihre eigenen API-Keys. Sie zahlen direkt an
              die LLM-Anbieter (OpenAI, Anthropic, Google) und behalten volle Kontrolle
              über Ihre Nutzung und Kosten. Ihre Keys werden verschlüsselt gespeichert.
            </p>
          </div>

          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>API-Key hinzufügen</span>
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <AddAPIKeyForm
              onAdd={handleAddKey}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* API Keys List */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 font-medium">Lade API-Keys...</p>
              </div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Noch keine API-Keys
              </h3>
              <p className="text-gray-600">
                Fügen Sie Ihren ersten API-Key hinzu, um mit der Analyse zu beginnen.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <APIKeyCard
                  key={key.id}
                  apiKey={key}
                  onDelete={handleDeleteKey}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Add API Key Form Component
function AddAPIKeyForm({
  onAdd,
  onCancel
}: {
  onAdd: (provider: LLMProvider, apiKey: string) => Promise<void>
  onCancel: () => void
}) {
  const [provider, setProvider] = useState<LLMProvider>('claude')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onAdd(provider, apiKey)
    setSaving(false)
    setApiKey('')
  }

  const getPlaceholder = () => {
    switch (provider) {
      case 'claude':
        return 'sk-ant-api03-...'
      case 'openai':
        return 'sk-proj-...'
      case 'gemini':
        return 'AIza...'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Neuen API-Key hinzufügen
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as LLMProvider)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="claude">Anthropic Claude</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API-Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Ihr API-Key wird verschlüsselt gespeichert
          </p>
        </div>

        {/* Provider Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            {provider === 'claude' && (
              <>
                API-Key erhalten Sie unter:{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  console.anthropic.com
                </a>
              </>
            )}
            {provider === 'openai' && (
              <>
                API-Key erhalten Sie unter:{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  platform.openai.com
                </a>
              </>
            )}
            {provider === 'gemini' && (
              <>
                API-Key erhalten Sie unter:{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  makersuite.google.com
                </a>
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={saving || !apiKey}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Speichere...' : 'Speichern'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}

// API Key Card Component
function APIKeyCard({
  apiKey,
  onDelete,
  onToggleActive
}: {
  apiKey: APIKey
  onDelete: (id: string) => void
  onToggleActive: (id: string, currentActive: boolean) => void
}) {
  const getProviderName = (provider: LLMProvider) => {
    switch (provider) {
      case 'claude':
        return 'Anthropic Claude'
      case 'openai':
        return 'OpenAI'
      case 'gemini':
        return 'Google Gemini'
    }
  }

  const getProviderColor = (provider: LLMProvider) => {
    switch (provider) {
      case 'claude':
        return 'from-orange-500 to-red-500'
      case 'openai':
        return 'from-green-500 to-emerald-500'
      case 'gemini':
        return 'from-blue-500 to-indigo-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div
            className={`bg-gradient-to-br ${getProviderColor(
              apiKey.provider
            )} p-3 rounded-lg`}
          >
            <Key className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">
              {getProviderName(apiKey.provider)}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Endet auf: ****{apiKey.key_last_four}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>
                Erstellt: {new Date(apiKey.created_at).toLocaleDateString('de-DE')}
              </span>
              {apiKey.last_used_at && (
                <span>
                  Zuletzt verwendet:{' '}
                  {new Date(apiKey.last_used_at).toLocaleDateString('de-DE')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleActive(apiKey.id, apiKey.is_active)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              apiKey.is_active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {apiKey.is_active ? (
              <span className="flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Aktiv</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <X className="w-4 h-4" />
                <span>Inaktiv</span>
              </span>
            )}
          </button>
          <button
            onClick={() => onDelete(apiKey.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Löschen"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

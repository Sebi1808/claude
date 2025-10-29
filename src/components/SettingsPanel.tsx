'use client'

import { useState } from 'react'
import { Settings, Target, Building2, Sparkles, Eye, EyeOff, Check, X } from 'lucide-react'
import { useSettingsStore, getProviderName, getModelName, getModelsForProvider, getTargetAudienceName } from '@/store/settingsStore'
import { testAPIKey } from '@/lib/llmProvider'
import UsageMeter from '@/components/UsageMeter'
import type { LLMProvider, TargetAudience } from '@/types/storycheck'

export default function SettingsPanel() {
  const {
    apiKeys,
    selectedProvider,
    selectedModel,
    targetAudience,
    organizationSettings,
    analysisMode,
    setAPIKey,
    setProvider,
    setModel,
    setTargetAudience,
    setOrganizationSettings,
    setAnalysisMode
  } = useSettingsStore()

  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const [isTestingKey, setIsTestingKey] = useState(false)
  const [keyTestResult, setKeyTestResult] = useState<{ valid: boolean; message: string } | null>(null)

  const currentApiKey = apiKeys[selectedProvider]

  const handleProviderChange = (provider: LLMProvider) => {
    setProvider(provider)
    setTempApiKey(apiKeys[provider] || '')
    setKeyTestResult(null)
  }

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      setKeyTestResult({ valid: false, message: 'Bitte geben Sie einen API-Key ein' })
      return
    }

    setIsTestingKey(true)
    setKeyTestResult(null)

    try {
      // Test API key via server-side route (avoids CORS)
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: tempApiKey
        })
      })

      const result = await response.json()

      setIsTestingKey(false)

      if (result.valid) {
        setAPIKey(selectedProvider, tempApiKey)
        setKeyTestResult({ valid: true, message: 'API-Key gespeichert und getestet ✓' })
        setTimeout(() => setKeyTestResult(null), 3000)
      } else {
        setKeyTestResult({ valid: false, message: `Fehler: ${result.error || 'Ungültiger Key'}` })
      }
    } catch (error) {
      setIsTestingKey(false)
      setKeyTestResult({ 
        valid: false, 
        message: `Netzwerkfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` 
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center space-x-2 text-gray-800">
        <Settings className="w-5 h-5" />
        <h2 className="text-lg font-bold">Einstellungen</h2>
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
          <Target className="w-4 h-4" />
          <span>Zielgruppe</span>
        </div>
        <select
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="spender">Spender*innen</option>
          <option value="politik">Politik/Entscheider*innen</option>
          <option value="community">Community/Mitglieder</option>
          <option value="medien">Medien</option>
          <option value="oeffentlichkeit">Allgemeine Öffentlichkeit</option>
        </select>
      </div>

      {/* Organization Settings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
          <Building2 className="w-4 h-4" />
          <span>Organisation</span>
        </div>

        <input
          type="text"
          value={organizationSettings.name || ''}
          onChange={(e) => setOrganizationSettings({ name: e.target.value })}
          placeholder="Name der Organisation"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          value={organizationSettings.values?.join(', ') || ''}
          onChange={(e) => setOrganizationSettings({
            values: e.target.value.split(',').map(v => v.trim()).filter(v => v)
          })}
          placeholder="Werte (kommagetrennt): z.B. Nähe, Solidarität, Vielfalt"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Analysis Mode */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
          <Sparkles className="w-4 h-4" />
          <span>Analyse-Modus</span>
        </div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={analysisMode === 'quick'}
              onChange={() => setAnalysisMode('quick')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Quick (Checks 1-6)
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={analysisMode === 'deep'}
              onChange={() => setAnalysisMode('deep')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Deep (Alle 14 Checks)
            </span>
          </label>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* LLM Provider */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
          <Sparkles className="w-4 h-4" />
          <span>LLM Provider</span>
        </div>

        <div className="space-y-2">
          {(['claude', 'openai', 'gemini'] as LLMProvider[]).map((provider) => (
            <label key={provider} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={selectedProvider === provider}
                onChange={() => handleProviderChange(provider)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {getProviderName(provider)}
              </span>
              {apiKeys[provider] && (
                <span className="text-xs text-green-600 flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Konfiguriert
                </span>
              )}
            </label>
          ))}
        </div>

        {/* Model Selection */}
        <select
          value={selectedModel}
          onChange={(e) => setModel(e.target.value as any)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {getModelsForProvider(selectedProvider).map((model) => (
            <option key={model} value={model}>
              {getModelName(model)}
            </option>
          ))}
        </select>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-xs text-gray-600 font-medium">
            API-Key für {getProviderName(selectedProvider)}
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={tempApiKey || currentApiKey || ''}
              onChange={(e) => {
                setTempApiKey(e.target.value)
                setKeyTestResult(null)
              }}
              placeholder="sk-..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleSaveApiKey}
            disabled={isTestingKey}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingKey ? 'Teste...' : 'API-Key speichern & testen'}
          </button>

          {keyTestResult && (
            <div className={`text-xs p-2 rounded ${
              keyTestResult.valid
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {keyTestResult.message}
            </div>
          )}

          <p className="text-xs text-gray-500">
            🔒 Ihr API-Key wird nur lokal in Ihrem Browser gespeichert und niemals an externe Server gesendet.
          </p>
        </div>
      </div>

      {/* Usage Meter */}
      <div className="mt-4">
        <UsageMeter />
      </div>
    </div>
  )
}

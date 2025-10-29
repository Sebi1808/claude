'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import TextEditor from '@/components/TextEditor'
import ImageUpload from '@/components/ImageUpload'
import SettingsPanel from '@/components/SettingsPanel'
import AnalysisDashboard from '@/components/AnalysisDashboard'
import WelcomeModal from '@/components/WelcomeModal'
import { useSettingsStore } from '@/store/settingsStore'
import { analyzeContent } from '@/lib/analysisEngine'
import { hasCurrentProviderAPIKey, getCurrentAPIKey } from '@/store/settingsStore'
import type { AnalysisResult } from '@/types/storycheck'

export default function Home() {
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | undefined>()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | undefined>()
  const [error, setError] = useState<string | undefined>()

  const {
    selectedProvider,
    selectedModel,
    targetAudience,
    customTargetAudience,
    organizationSettings,
    selectedChecks,
    analysisMode,
    showWelcome
  } = useSettingsStore()

  const handleAnalyze = async (mode: 'quick' | 'deep') => {
    // Validation
    if (!text.trim()) {
      setError('Bitte geben Sie einen Text ein')
      return
    }

    if (!hasCurrentProviderAPIKey()) {
      setError('Bitte konfigurieren Sie zuerst einen API-Key in den Einstellungen')
      return
    }

    setIsAnalyzing(true)
    setError(undefined)
    setResult(undefined)

    try {
      const apiKey = getCurrentAPIKey()
      if (!apiKey) {
        throw new Error('API-Key nicht gefunden')
      }

      const checksToRun = mode === 'quick'
        ? [1, 2, 3, 4, 5, 6]
        : selectedChecks.length > 0
          ? selectedChecks
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

      const analysisResult = await analyzeContent(
        {
          text,
          image,
          targetAudience,
          organizationSettings,
          selectedChecks: checksToRun,
          analysisMode: mode
        },
        selectedProvider,
        selectedModel,
        apiKey
      )

      setResult(analysisResult)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  StoryCheck Democracy
                </h1>
                <p className="text-sm text-gray-600">
                  Analyse für demokratisches Storytelling
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Basierend auf den 14 Praxistipps
              </p>
              <p className="text-xs text-gray-500">
                von Sebastian Zollner
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Input + Results (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Social Media Post
              </h2>

              <TextEditor
                value={text}
                onChange={setText}
                placeholder="Geben Sie Ihren Social Media Post hier ein..."
              />

              <div className="mt-4">
                <ImageUpload
                  image={image}
                  onImageChange={setImage}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAnalyze('quick')}
                  disabled={isAnalyzing || !text.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>⚡</span>
                  <span>{isAnalyzing ? 'Analysiere...' : 'Quick Check'}</span>
                  <span className="text-xs opacity-75">(Checks 1-6)</span>
                </button>

                <button
                  onClick={() => handleAnalyze('deep')}
                  disabled={isAnalyzing || !text.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>🔍</span>
                  <span>{isAnalyzing ? 'Analysiere...' : 'Deep Analysis'}</span>
                  <span className="text-xs opacity-75">(Alle Checks)</span>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-red-800">Fehler</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {result && (
              <AnalysisDashboard result={result} />
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 font-medium">Analysiere Ihren Post...</p>
                  <p className="text-gray-500 text-sm">
                    Dies kann 10-30 Sekunden dauern
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Settings Sidebar (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SettingsPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      {showWelcome && <WelcomeModal />}
    </main>
  )
}

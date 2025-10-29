'use client'

import { X, Sparkles, Shield, Target } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'

export default function WelcomeModal() {
  const { setShowWelcome } = useSettingsStore()

  const handleClose = () => {
    setShowWelcome(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Willkommen bei StoryCheck Democracy!</h2>
          </div>
          <p className="text-blue-100">
            Ihr Tool für demokratisches Storytelling in Social Media
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Was ist StoryCheck Democracy?</h3>
            <p className="text-gray-600">
              Diese App analysiert Ihre Social Media Posts anhand von 14 wissenschaftlich fundierten Kriterien
              für demokratisches und inklusives Storytelling. Entwickelt basierend auf den Praxistipps von
              Sebastian Zollner.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">Hauptfunktionen</h3>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">14 Analyse-Checks</h4>
                <p className="text-sm text-gray-600">
                  Von Wertekongruenz über Diversität bis zu inklusiver Sprache - alle Aspekte
                  demokratischen Storytellings werden geprüft.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">KI-gestützte Analyse</h4>
                <p className="text-sm text-gray-600">
                  Nutzen Sie Claude, GPT-4 oder Gemini für präzise Analysen mit konkreten
                  Verbesserungsvorschlägen.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Datenschutz-First</h4>
                <p className="text-sm text-gray-600">
                  Alle Daten bleiben lokal in Ihrem Browser. Keine Speicherung auf externen Servern.
                </p>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3">🚀 So starten Sie:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                <span>
                  <strong>API-Key einrichten:</strong> Konfigurieren Sie in den Einstellungen (rechts)
                  Ihren API-Key für Claude, OpenAI oder Gemini.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                <span>
                  <strong>Zielgruppe wählen:</strong> Wählen Sie Ihre Zielgruppe aus (Spender, Community, etc.).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                <span>
                  <strong>Text eingeben:</strong> Fügen Sie Ihren Social Media Post ein.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">4.</span>
                <span>
                  <strong>Analysieren:</strong> Wählen Sie "Quick Check" (6 Checks) oder "Deep Analysis" (14 Checks).
                </span>
              </li>
            </ol>
          </div>

          {/* API Key Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">📝 API-Key benötigt</h4>
            <p className="text-sm text-gray-700 mb-2">
              Um die App zu nutzen, benötigen Sie einen API-Key von einem der folgenden Anbieter:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• <strong>Anthropic Claude:</strong> <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></li>
              <li>• <strong>OpenAI:</strong> <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a></li>
              <li>• <strong>Google Gemini:</strong> <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ai.google.dev</a></li>
            </ul>
          </div>

          {/* Attribution */}
          <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Basierend auf:</strong> "Storytelling mit Haltung: Linguistische Anregungen für
              bestärkende Narrative"
            </p>
            <p>
              <strong>Von:</strong> Sebastian Zollner, Sprachwissenschaftler & Dozent für Medien und Kommunikation
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Los geht's!
          </button>
        </div>
      </div>
    </div>
  )
}

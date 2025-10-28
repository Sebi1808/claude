'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { TextAnalysisResult } from '@/types'
import AnalysisResults from './AnalysisResults'

export default function TextChecker() {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<TextAnalysisResult | null>(null)

  const analyzeText = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Fehler bei der Analyse:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Text prüfen</h2>

      <div className="mb-6">
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
          Ihr Social Media Text
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Geben Sie hier Ihren Text ein..."
        />
        <div className="mt-2 text-sm text-gray-500">
          Zeichen: {text.length}
        </div>
      </div>

      <button
        onClick={analyzeText}
        disabled={!text.trim() || isAnalyzing}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analysiere...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Text analysieren
          </>
        )}
      </button>

      {result && (
        <div className="mt-8">
          <AnalysisResults result={result} type="text" />
        </div>
      )}
    </div>
  )
}

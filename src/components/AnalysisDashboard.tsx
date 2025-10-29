'use client'

import { useState } from 'react'
import { TrendingUp, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import type { AnalysisResult, CheckStatus } from '@/types/storycheck'

interface AnalysisDashboardProps {
  result: AnalysisResult
}

export default function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Storytelling-Score</h2>
          </div>

          <div className="text-6xl font-bold">
            {result.overallScore}
            <span className="text-3xl opacity-75">/100</span>
          </div>

          <div className="flex items-center justify-center">
            <StatusBadge status={result.overallStatus} size="large" />
          </div>

          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            {result.summary}
          </p>

          <div className="flex items-center justify-center space-x-4 text-sm opacity-75">
            <span>{result.checks.length} Checks durchgeführt</span>
            <span>•</span>
            <span>{result.checks.filter(c => c.status === 'gut').length} gut</span>
            <span>•</span>
            <span>{result.checks.filter(c => c.status === 'verbesserungswürdig').length} verbesserungswürdig</span>
            <span>•</span>
            <span>{result.checks.filter(c => c.status === 'problematisch').length} problematisch</span>
          </div>
        </div>
      </div>

      {/* Check Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.checks.map((check) => (
          <CheckCard key={check.checkId} check={check} />
        ))}
      </div>
    </div>
  )
}

interface CheckCardProps {
  check: AnalysisResult['checks'][0]
}

function CheckCard({ check }: CheckCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedSuggestion, setCopiedSuggestion] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSuggestion(true)
    setTimeout(() => setCopiedSuggestion(false), 2000)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden ${
      check.status === 'gut' ? 'border-green-500' :
      check.status === 'verbesserungswürdig' ? 'border-yellow-500' :
      'border-red-500'
    }`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-gray-800">{check.checkName}</h3>
              <StatusBadge status={check.status} size="small" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{check.score}</span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600">{check.analysis}</p>

        {/* Quick Problems/Suggestions */}
        {!isExpanded && (check.problems.length > 0 || check.suggestions.length > 0) && (
          <div className="mt-3 space-y-2">
            {check.problems.length > 0 && (
              <div className="text-xs text-red-600">
                ⚠️ {check.problems.length} Problem{check.problems.length > 1 ? 'e' : ''}
              </div>
            )}
            {check.suggestions.length > 0 && (
              <div className="text-xs text-blue-600">
                💡 {check.suggestions.length} Vorschlag{check.suggestions.length > 1 ? 'e' : ''}
              </div>
            )}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors"
        >
          <span>{isExpanded ? 'Weniger' : 'Details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {/* Problems */}
          {check.problems.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-800 mb-2">⚠️ Erkannte Probleme:</h4>
              <ul className="space-y-1">
                {check.problems.map((problem, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {check.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-800 mb-2">💡 Verbesserungsvorschläge:</h4>
              <ul className="space-y-1">
                {check.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternative Formulation */}
          {check.alternativeFormulation && (
            <div>
              <h4 className="font-semibold text-sm text-gray-800 mb-2">✏️ Alternative Formulierung:</h4>
              <div className="bg-white border border-gray-300 rounded-lg p-3 relative">
                <p className="text-sm text-gray-700 italic pr-8">
                  "{check.alternativeFormulation}"
                </p>
                <button
                  onClick={() => handleCopy(check.alternativeFormulation!)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="In Zwischenablage kopieren"
                >
                  {copiedSuggestion ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface StatusBadgeProps {
  status: CheckStatus
  size?: 'small' | 'large'
}

function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const sizeClasses = size === 'large' ? 'px-6 py-2 text-base' : 'px-2 py-1 text-xs'

  const statusConfig = {
    gut: {
      icon: '🟢',
      text: 'Gut',
      classes: 'bg-green-100 text-green-800 border border-green-300'
    },
    verbesserungswürdig: {
      icon: '🟡',
      text: 'Verbesserungswürdig',
      classes: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
    },
    problematisch: {
      icon: '🔴',
      text: 'Problematisch',
      classes: 'bg-red-100 text-red-800 border border-red-300'
    }
  }

  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full font-semibold ${sizeClasses} ${config.classes}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  )
}

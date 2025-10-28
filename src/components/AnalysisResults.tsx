'use client'

import { TextAnalysisResult, ImageAnalysisResult } from '@/types'
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface Props {
  result: TextAnalysisResult | ImageAnalysisResult
  type: 'text' | 'image'
}

export default function AnalysisResults({ result, type }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Gesamtbewertung */}
      <div className={`p-6 rounded-lg ${getScoreBg(result.score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Gesamtbewertung
            </h3>
            <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
              {result.score.toFixed(0)}/100
            </p>
          </div>
          <div>
            {result.passed ? (
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                result.score >= 80 ? 'bg-green-600' :
                result.score >= 60 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Kriterien-Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Detaillierte Bewertung
        </h3>
        <div className="space-y-3">
          {result.criteriaResults.map((cr) => (
            <div
              key={cr.criterionId}
              className={`p-4 rounded-lg border-2 ${
                cr.passed
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {cr.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <h4 className="font-semibold text-gray-800">
                      {cr.criterionName}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 ml-7">{cr.feedback}</p>
                </div>
                <span className={`ml-4 font-bold ${getScoreColor(cr.score)}`}>
                  {cr.score.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verbesserungsvorschläge */}
      {result.suggestions.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
            Verbesserungsvorschläge
          </h3>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

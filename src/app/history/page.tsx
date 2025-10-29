'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { History, Filter, Download, Eye, Search, Calendar, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { LLMProvider, CheckStatus } from '@/types/storycheck'

interface AnalysisRecord {
  id: string
  input_text: string
  llm_provider: LLMProvider
  llm_model: string
  overall_score: number
  overall_status: CheckStatus
  checks_results: any
  created_at: string
  analysis_metadata?: {
    target_audience?: string
    analysis_mode?: string
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProvider, setFilterProvider] = useState<LLMProvider | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<CheckStatus | 'all'>('all')
  const [filterDateRange, setFilterDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all')

  // Load analyses on mount
  useEffect(() => {
    loadAnalyses()
  }, [])

  // Apply filters when analyses or filter values change
  useEffect(() => {
    applyFilters()
  }, [analyses, searchTerm, filterProvider, filterStatus, filterDateRange])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError

      setAnalyses(data || [])
    } catch (err: any) {
      console.error('Error loading analyses:', err)
      setError(err.message || 'Fehler beim Laden der Analysen')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...analyses]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((a) =>
        a.input_text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Provider filter
    if (filterProvider !== 'all') {
      filtered = filtered.filter((a) => a.llm_provider === filterProvider)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.overall_status === filterStatus)
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date()
      const days = filterDateRange === '7d' ? 7 : filterDateRange === '30d' ? 30 : 90
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((a) => new Date(a.created_at) >= cutoff)
    }

    setFilteredAnalyses(filtered)
  }

  const handleExportJSON = (analysis: AnalysisRecord) => {
    const dataStr = JSON.stringify(analysis, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analyse-${analysis.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAllJSON = () => {
    const dataStr = JSON.stringify(filteredAnalyses, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analysen-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'gut':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'verbesserungswürdig':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'problematisch':
        return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  const getStatusLabel = (status: CheckStatus) => {
    switch (status) {
      case 'gut':
        return '✓ Gut'
      case 'verbesserungswürdig':
        return '⚠ Verbesserungswürdig'
      case 'problematisch':
        return '✗ Problematisch'
    }
  }

  const getProviderName = (provider: LLMProvider) => {
    switch (provider) {
      case 'claude':
        return 'Claude'
      case 'openai':
        return 'OpenAI'
      case 'gemini':
        return 'Gemini'
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
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Analyse-Historie</h1>
                <p className="text-sm text-gray-600">
                  {filteredAnalyses.length} von {analyses.length} Analysen
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {filteredAnalyses.length > 0 && (
                <button
                  onClick={handleExportAllJSON}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportieren</span>
                </button>
              )}
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Zurück
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Text durchsuchen..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Provider Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Provider</option>
                <option value="claude">Claude</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Status</option>
                <option value="gut">Gut</option>
                <option value="verbesserungswürdig">Verbesserungswürdig</option>
                <option value="problematisch">Problematisch</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zeitraum
              </label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle</option>
                <option value="7d">Letzte 7 Tage</option>
                <option value="30d">Letzte 30 Tage</option>
                <option value="90d">Letzte 90 Tage</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analyses List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 font-medium">Lade Analysen...</p>
            </div>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {analyses.length === 0 ? 'Noch keine Analysen' : 'Keine Analysen gefunden'}
            </h3>
            <p className="text-gray-600">
              {analyses.length === 0
                ? 'Führen Sie Ihre erste Analyse durch, um sie hier zu sehen.'
                : 'Versuchen Sie, die Filter anzupassen.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnalyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onView={() => setSelectedAnalysis(analysis)}
                onExport={() => handleExportJSON(analysis)}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                getProviderName={getProviderName}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAnalysis && (
        <AnalysisDetailModal
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />
      )}
    </div>
  )
}

// Analysis Card Component
function AnalysisCard({
  analysis,
  onView,
  onExport,
  getStatusColor,
  getStatusLabel,
  getProviderName,
}: {
  analysis: AnalysisRecord
  onView: () => void
  onExport: () => void
  getStatusColor: (status: CheckStatus) => string
  getStatusLabel: (status: CheckStatus) => string
  getProviderName: (provider: LLMProvider) => string
}) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                analysis.overall_status
              )}`}
            >
              {getStatusLabel(analysis.overall_status)}
            </span>
            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
              Score: {analysis.overall_score}/100
            </span>
          </div>
          <p className="text-gray-700 mb-2">{truncateText(analysis.input_text, 200)}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>{getProviderName(analysis.llm_provider)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(analysis.created_at).toLocaleString('de-DE')}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={onView}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Analysis Detail Modal Component
function AnalysisDetailModal({
  analysis,
  onClose,
  getStatusColor,
  getStatusLabel,
}: {
  analysis: AnalysisRecord
  onClose: () => void
  getStatusColor: (status: CheckStatus) => string
  getStatusLabel: (status: CheckStatus) => string
}) {
  const checks = analysis.checks_results?.checks || []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Analyse-Details
                </h2>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                      analysis.overall_status
                    )}`}
                  >
                    {getStatusLabel(analysis.overall_status)}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                    Score: {analysis.overall_score}/100
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Original Text */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Original-Text
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {analysis.input_text}
                </p>
              </div>
            </div>

            {/* Checks Results */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Check-Ergebnisse ({checks.length} Checks)
              </h3>
              <div className="space-y-4">
                {checks.map((check: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-800">
                        Check {check.checkId}: {check.checkName}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          check.status
                        )}`}
                      >
                        {check.score}/100
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{check.analysis}</p>
                    {check.problems && check.problems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Probleme:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {check.problems.map((problem: string, i: number) => (
                            <li key={i}>{problem}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {check.suggestions && check.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Vorschläge:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {check.suggestions.map((suggestion: string, i: number) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Provider:</span>{' '}
                  {analysis.llm_provider}
                </div>
                <div>
                  <span className="font-semibold">Model:</span> {analysis.llm_model}
                </div>
                <div>
                  <span className="font-semibold">Erstellt:</span>{' '}
                  {new Date(analysis.created_at).toLocaleString('de-DE')}
                </div>
                <div>
                  <span className="font-semibold">ID:</span> {analysis.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

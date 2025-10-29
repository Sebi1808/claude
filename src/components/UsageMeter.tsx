'use client'

import { useState, useEffect } from 'react'
import { BarChart3, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UsageData {
  tier: string
  usage: {
    analyses_this_month: number
    analyses_limit: number | null
    limit_reached: boolean
  }
  subscription_active: boolean
}

export default function UsageMeter() {
  const router = useRouter()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const response = await fetch('/api/usage/check-limits')
      const data = await response.json()
      setUsage(data)
    } catch (error) {
      console.error('Failed to load usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !usage || !usage.usage) return null

  const { analyses_this_month, analyses_limit, limit_reached } = usage.usage
  const percentage =
    analyses_limit !== null
      ? Math.min((analyses_this_month / analyses_limit) * 100, 100)
      : 0

  const isUnlimited = analyses_limit === null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Nutzung</h3>
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase">
          {usage.tier}
        </span>
      </div>

      {isUnlimited ? (
        <div className="text-center py-2">
          <p className="text-sm text-gray-700 font-medium">Unbegrenzte Analysen</p>
          <p className="text-xs text-gray-500 mt-1">
            {analyses_this_month} diesen Monat
          </p>
        </div>
      ) : (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">
                {analyses_this_month} / {analyses_limit} Analysen
              </span>
              <span className="text-gray-600">{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  limit_reached
                    ? 'bg-red-500'
                    : percentage > 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {limit_reached && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Limit erreicht
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Upgraden Sie für mehr Analysen
                  </p>
                  <button
                    onClick={() => router.push('/settings/subscription')}
                    className="mt-2 text-xs font-semibold text-red-700 hover:text-red-800 underline"
                  >
                    Jetzt upgraden →
                  </button>
                </div>
              </div>
            </div>
          )}

          {!limit_reached && percentage > 80 && (
            <button
              onClick={() => router.push('/settings/subscription')}
              className="mt-3 w-full text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mehr Analysen? Jetzt upgraden →
            </button>
          )}
        </>
      )}
    </div>
  )
}

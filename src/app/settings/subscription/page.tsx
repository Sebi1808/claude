'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Check, X, Crown, Zap, Building2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { TIER_LIMITS, TIER_PRICES } from '@/types/subscription'
import type { SubscriptionTier } from '@/types/subscription'

interface UserSubscription {
  subscription_tier: SubscriptionTier
  subscription_status: string
  subscription_current_period_end?: string
}

function SubscriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userSub, setUserSub] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSubscription()

    // Check for success/cancel from Stripe redirect
    if (searchParams.get('success') === 'true') {
      setSuccess('Abonnement erfolgreich aktiviert!')
    } else if (searchParams.get('canceled') === 'true') {
      setError('Zahlung abgebrochen.')
    }
  }, [searchParams])

  const loadSubscription = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('subscription_tier, subscription_status, subscription_current_period_end')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      setUserSub(data)
    } catch (err: any) {
      console.error('Error loading subscription:', err)
      setError(err.message || 'Fehler beim Laden des Abonnements')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === 'free') return

    try {
      setUpgrading(true)
      setError(null)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Erstellen der Checkout-Session')
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err: any) {
      console.error('Upgrade error:', err)
      setError(err.message || 'Fehler beim Upgrade')
      setUpgrading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setError(null)

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Öffnen des Kundenportals')
      }

      if (result.url) {
        window.location.href = result.url
      }
    } catch (err: any) {
      console.error('Portal error:', err)
      setError(err.message || 'Fehler beim Öffnen des Kundenportals')
    }
  }

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return <CreditCard className="w-8 h-8" />
      case 'starter':
        return <Zap className="w-8 h-8" />
      case 'professional':
        return <Crown className="w-8 h-8" />
      case 'enterprise':
        return <Building2 className="w-8 h-8" />
    }
  }

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'from-gray-500 to-gray-600'
      case 'starter':
        return 'from-blue-500 to-blue-600'
      case 'professional':
        return 'from-purple-500 to-purple-600'
      case 'enterprise':
        return 'from-orange-500 to-orange-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Lade Abonnement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Abonnement</h1>
                <p className="text-sm text-gray-600">Verwalten Sie Ihr Abo</p>
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
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <X className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Current Subscription */}
        {userSub && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Aktuelles Abonnement
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`bg-gradient-to-br ${getTierColor(
                    userSub.subscription_tier
                  )} p-3 rounded-lg text-white`}
                >
                  {getTierIcon(userSub.subscription_tier)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 capitalize">
                    {userSub.subscription_tier}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className="capitalize">{userSub.subscription_status}</span>
                  </p>
                  {userSub.subscription_current_period_end && (
                    <p className="text-xs text-gray-500">
                      Läuft bis:{' '}
                      {new Date(userSub.subscription_current_period_end).toLocaleDateString(
                        'de-DE'
                      )}
                    </p>
                  )}
                </div>
              </div>

              {userSub.subscription_tier !== 'free' && (
                <button
                  onClick={handleManageSubscription}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  Abo verwalten
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Verfügbare Pläne
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['free', 'starter', 'professional', 'enterprise'] as SubscriptionTier[]).map(
            (tier) => {
              const limits = TIER_LIMITS[tier]
              const price = TIER_PRICES[tier]
              const isCurrent = userSub?.subscription_tier === tier

              return (
                <div
                  key={tier}
                  className={`bg-white rounded-lg shadow-md p-6 ${
                    isCurrent ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex bg-gradient-to-br ${getTierColor(
                        tier
                      )} p-3 rounded-lg text-white mb-3`}
                    >
                      {getTierIcon(tier)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 capitalize mb-2">
                      {tier}
                    </h3>
                    <div className="text-3xl font-bold text-gray-900">
                      €{price}
                      <span className="text-sm text-gray-600 font-normal">/Monat</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        {limits.analyses_per_month === null
                          ? 'Unbegrenzte'
                          : limits.analyses_per_month}{' '}
                        Analysen/Monat
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      {limits.vision_analysis ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span>Vision-Analyse</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      {limits.org_profile ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span>Organisations-Profil</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      {limits.api_access ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span>API-Zugriff</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      {limits.team_members ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span>
                        {limits.team_members
                          ? `${limits.team_members} Team-Mitglieder`
                          : 'Kein Team'}
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Historie:{' '}
                        {limits.history_days === null
                          ? 'Unbegrenzt'
                          : `${limits.history_days} Tage`}
                      </span>
                    </li>
                  </ul>

                  {/* CTA Button */}
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Aktueller Plan
                    </button>
                  ) : tier === 'free' ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Kostenlos
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(tier)}
                      disabled={upgrading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {upgrading ? 'Lädt...' : 'Jetzt upgraden'}
                    </button>
                  )}
                </div>
              )
            }
          )}
        </div>

        {/* BYOK Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-2">
            BYOK - Bring Your Own Keys
          </h3>
          <p className="text-blue-700 text-sm">
            Alle Preise verstehen sich als Plattformgebühren. Sie verwenden Ihre eigenen
            LLM API-Keys und zahlen die API-Kosten direkt an OpenAI, Anthropic oder
            Google. Sie behalten volle Kontrolle über Ihre Nutzung und Kosten.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Lade Abonnement...</p>
        </div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  )
}

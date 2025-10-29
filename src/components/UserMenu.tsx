'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User, LogOut, Settings, CreditCard, History, Building2, Key } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // DEMO MODE: Mock Admin User
    const mockUser = {
      id: 'demo-admin-123',
      email: 'admin@demo.de',
      user_metadata: {
        full_name: 'Admin (Demo)',
      },
    } as SupabaseUser

    setUser(mockUser)

    // Original Auth Code (auskommentiert für Demo)
    /*
    // Get current user
    supabase?.auth?.getUser().then(({ data: { user } }) => {
      setUser(user)
    }).catch(() => {})

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
    */
  }, [])

  const handleSignOut = async () => {
    // DEMO MODE: Nur Seite neu laden
    window.location.href = '/'
    
    // Original: await supabase.auth.signOut()
    // router.push('/auth/login')
    // router.refresh()
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-800">
            {user.user_metadata?.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-500">Free Tier</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  router.push('/history')
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
              >
                <History className="w-4 h-4" />
                <span>Analyse-Historie</span>
              </button>

              <button
                onClick={() => {
                  router.push('/api-keys')
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
              >
                <Key className="w-4 h-4" />
                <span>API-Keys</span>
              </button>

              <button
                onClick={() => {
                  router.push('/settings/subscription')
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
              >
                <CreditCard className="w-4 h-4" />
                <span>Abo & Bezahlung</span>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

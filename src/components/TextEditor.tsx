'use client'

import { useState, useEffect } from 'react'
import { Type, Hash } from 'lucide-react'
import { PLATFORM_LIMITS } from '@/types/storycheck'

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function TextEditor({ value, onChange, placeholder }: TextEditorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORM_LIMITS>('twitter')

  const charCount = value.length
  const limit = PLATFORM_LIMITS[selectedPlatform]
  const percentage = (charCount / limit) * 100
  const isNearLimit = percentage > 80
  const isOverLimit = percentage > 100

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Type className="w-4 h-4" />
          <span className="font-medium">Text</span>
        </div>

        {/* Platform Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Plattform:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as keyof typeof PLATFORM_LIMITS)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="twitter">Twitter (280)</option>
            <option value="linkedin">LinkedIn (3000)</option>
            <option value="instagram">Instagram (2200)</option>
            <option value="facebook">Facebook (63k)</option>
            <option value="threads">Threads (500)</option>
          </select>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Geben Sie Ihren Text ein...'}
        className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-sans text-base"
      />

      {/* Character Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Zeichen:
              <span className={`ml-1 font-semibold ${
                isOverLimit ? 'text-red-600' :
                isNearLimit ? 'text-orange-600' :
                'text-gray-800'
              }`}>
                {charCount}
              </span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-500">{limit}</span>
            </span>
          </div>

          {/* Word Count */}
          <div className="text-sm text-gray-600">
            Wörter:
            <span className="ml-1 font-semibold text-gray-800">
              {value.trim() ? value.trim().split(/\s+/).length : 0}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverLimit ? 'bg-red-500' :
                isNearLimit ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${
            isOverLimit ? 'text-red-600' :
            isNearLimit ? 'text-orange-600' :
            'text-gray-600'
          }`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Warning */}
      {isOverLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <span className="text-red-500 text-sm">⚠️</span>
          <p className="text-red-700 text-sm">
            Der Text überschreitet das Zeichenlimit für {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}.
          </p>
        </div>
      )}
    </div>
  )
}

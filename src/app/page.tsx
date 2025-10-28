'use client'

import { useState } from 'react'
import TextChecker from '@/components/TextChecker'
import ImageChecker from '@/components/ImageChecker'
import CriteriaManager from '@/components/CriteriaManager'
import { CheckCircle2, FileText, Image as ImageIcon, Settings } from 'lucide-react'

type Tab = 'text' | 'image' | 'criteria'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('text')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Social Media Content Checker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Prüfen Sie Ihre Texte und Bilder nach festgelegten Kriterien
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center px-6 py-3 rounded-md transition-all ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Text prüfen
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center px-6 py-3 rounded-md transition-all ${
                activeTab === 'image'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Bild prüfen
            </button>
            <button
              onClick={() => setActiveTab('criteria')}
              className={`flex items-center px-6 py-3 rounded-md transition-all ${
                activeTab === 'criteria'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5 mr-2" />
              Kriterien
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'text' && <TextChecker />}
          {activeTab === 'image' && <ImageChecker />}
          {activeTab === 'criteria' && <CriteriaManager />}
        </div>
      </div>
    </main>
  )
}

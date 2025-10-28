'use client'

import { useState, useEffect } from 'react'
import { Criterion } from '@/types'
import { defaultCriteria } from '@/data/defaultCriteria'
import { FileText, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react'

export default function CriteriaManager() {
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria)

  useEffect(() => {
    // Lade gespeicherte Kriterien aus localStorage
    const saved = localStorage.getItem('criteria')
    if (saved) {
      setCriteria(JSON.parse(saved))
    }
  }, [])

  const toggleCriterion = (id: string) => {
    const updated = criteria.map(c =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    )
    setCriteria(updated)
    localStorage.setItem('criteria', JSON.stringify(updated))
  }

  const updateWeight = (id: string, weight: number) => {
    const updated = criteria.map(c =>
      c.id === id ? { ...c, weight } : c
    )
    setCriteria(updated)
    localStorage.setItem('criteria', JSON.stringify(updated))
  }

  const resetToDefault = () => {
    setCriteria(defaultCriteria)
    localStorage.setItem('criteria', JSON.stringify(defaultCriteria))
  }

  const textCriteria = criteria.filter(c => c.category === 'text')
  const imageCriteria = criteria.filter(c => c.category === 'image')

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Prüfkriterien verwalten</h2>
        <button
          onClick={resetToDefault}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Text-Kriterien */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FileText className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Text-Kriterien</h3>
        </div>
        <div className="space-y-4">
          {textCriteria.map(criterion => (
            <CriterionItem
              key={criterion.id}
              criterion={criterion}
              onToggle={toggleCriterion}
              onWeightChange={updateWeight}
            />
          ))}
        </div>
      </div>

      {/* Bild-Kriterien */}
      <div>
        <div className="flex items-center mb-4">
          <ImageIcon className="w-6 h-6 text-purple-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Bild-Kriterien</h3>
        </div>
        <div className="space-y-4">
          {imageCriteria.map(criterion => (
            <CriterionItem
              key={criterion.id}
              criterion={criterion}
              onToggle={toggleCriterion}
              onWeightChange={updateWeight}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CriterionItem({
  criterion,
  onToggle,
  onWeightChange,
}: {
  criterion: Criterion
  onToggle: (id: string) => void
  onWeightChange: (id: string, weight: number) => void
}) {
  return (
    <div className={`p-4 border rounded-lg ${criterion.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{criterion.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
        </div>
        <button
          onClick={() => onToggle(criterion.id)}
          className="ml-4"
        >
          {criterion.enabled ? (
            <ToggleRight className="w-10 h-10 text-blue-600" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-gray-400" />
          )}
        </button>
      </div>

      {criterion.enabled && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gewichtung: {criterion.weight}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={criterion.weight}
            onChange={(e) => onWeightChange(criterion.id, parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}

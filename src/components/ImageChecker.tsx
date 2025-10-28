'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, X } from 'lucide-react'
import { ImageAnalysisResult } from '@/types'
import AnalysisResults from './AnalysisResults'

export default function ImageChecker() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ImageAnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImage(null)
    setFileName('')
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const analyzeImage = async () => {
    if (!image) return

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bild prüfen</h2>

      <div className="mb-6">
        {!image ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-16 h-16 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700 mb-2">
                Bild hochladen
              </span>
              <span className="text-sm text-gray-500">
                PNG, JPG, GIF bis 10MB
              </span>
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={image}
              alt="Hochgeladenes Bild"
              className="w-full rounded-lg max-h-96 object-contain"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-2 text-sm text-gray-600">
              {fileName}
            </div>
          </div>
        )}
      </div>

      {image && (
        <button
          onClick={analyzeImage}
          disabled={isAnalyzing}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analysiere...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Bild analysieren
            </>
          )}
        </button>
      )}

      {result && (
        <div className="mt-8">
          <AnalysisResults result={result} type="image" />
        </div>
      )}
    </div>
  )
}

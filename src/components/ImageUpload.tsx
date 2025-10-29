'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  image?: File
  onImageChange: (image: File | undefined) => void
}

export default function ImageUpload({ image, onImageChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Maximal 10MB erlaubt.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onImageChange(file)
  }

  const handleRemove = () => {
    setPreview(undefined)
    onImageChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <ImageIcon className="w-4 h-4" />
        <span className="font-medium">Bild (optional)</span>
      </div>

      {preview ? (
        // Preview
        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-96 object-contain bg-gray-50"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Bild entfernen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Upload Zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className={`
              p-4 rounded-full
              ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>

            <div>
              <p className="text-gray-700 font-medium">
                {isDragging ? 'Bild hier ablegen' : 'Bild hochladen'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Drag & Drop oder klicken Sie hier
              </p>
            </div>

            <p className="text-xs text-gray-400">
              PNG, JPG, WebP bis 10MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {image && (
        <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">{image.name}</span>
          </div>
          <span className="text-gray-500 text-xs">
            {(image.size / 1024).toFixed(1)} KB
          </span>
        </div>
      )}
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/imageAnalyzer'
import { defaultCriteria } from '@/data/defaultCriteria'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Bild ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob es ein valides Base64-Bild ist
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Ungültiges Bildformat' },
        { status: 400 }
      )
    }

    // In einer echten Anwendung würden die Kriterien aus einer Datenbank
    // oder aus der Anfrage geladen werden
    const criteria = defaultCriteria

    const result = analyzeImage(image, criteria)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fehler bei der Bildanalyse:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Analyse' },
      { status: 500 }
    )
  }
}

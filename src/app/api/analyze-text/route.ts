import { NextRequest, NextResponse } from 'next/server'
import { analyzeText } from '@/lib/textAnalyzer'
import { defaultCriteria } from '@/data/defaultCriteria'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      )
    }

    // In einer echten Anwendung würden die Kriterien aus einer Datenbank
    // oder aus der Anfrage geladen werden
    const criteria = defaultCriteria

    const result = analyzeText(text, criteria)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fehler bei der Textanalyse:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Analyse' },
      { status: 500 }
    )
  }
}

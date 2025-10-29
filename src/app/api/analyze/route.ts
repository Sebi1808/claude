import { NextRequest, NextResponse } from 'next/server'
import { analyzeContent } from '@/lib/analysisEngine'
import type { LLMProvider, LLMModel, AnalysisInput } from '@/types/storycheck'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds timeout for long analyses

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      text,
      image,
      targetAudience,
      organizationSettings,
      selectedChecks,
      analysisMode,
      provider,
      model,
      apiKey
    } = body

    // Validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      )
    }

    if (!provider || !model || !apiKey) {
      return NextResponse.json(
        { error: 'LLM-Provider, Model und API-Key sind erforderlich' },
        { status: 400 }
      )
    }

    if (!selectedChecks || !Array.isArray(selectedChecks) || selectedChecks.length === 0) {
      return NextResponse.json(
        { error: 'Mindestens ein Check muss ausgewählt sein' },
        { status: 400 }
      )
    }

    // Build analysis input
    const analysisInput: AnalysisInput = {
      text,
      image,
      targetAudience: targetAudience || 'oeffentlichkeit',
      organizationSettings: organizationSettings || { name: '', values: [], description: '' },
      selectedChecks,
      analysisMode: analysisMode || 'quick'
    }

    // Run analysis server-side (avoids CORS issues)
    const result = await analyzeContent(
      analysisInput,
      provider as LLMProvider,
      model as LLMModel,
      apiKey
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Fehler bei der Analyse',
        details: error.stack 
      },
      { status: 500 }
    )
  }
}


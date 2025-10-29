// ============================================
// ANALYSIS ENGINE - Core Analysis Logic
// Implements the 14 checks for democratic storytelling
// ============================================

import { callLLM, callVisionLLM } from './llmProvider'
import { CHECK_DEFINITIONS } from '@/types/storycheck'
import type {
  LLMProvider,
  LLMModel,
  CheckResult,
  CheckStatus,
  AnalysisInput,
  AnalysisResult,
  TargetAudience,
  OrganizationSettings
} from '@/types/storycheck'

/**
 * Main analysis function - runs selected checks
 */
export async function analyzeContent(
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<AnalysisResult> {
  const startTime = Date.now()
  const checkResults: CheckResult[] = []

  // Run each selected check
  for (const checkId of input.selectedChecks.sort((a, b) => a - b)) {
    try {
      const result = await runCheck(
        checkId,
        input,
        provider,
        model,
        apiKey
      )
      checkResults.push(result)
    } catch (error) {
      console.error(`Error running check ${checkId}:`, error)
      // Add error result
      checkResults.push({
        checkId,
        checkName: CHECK_DEFINITIONS[checkId - 1].name,
        score: 0,
        status: 'problematisch',
        analysis: 'Fehler bei der Analyse',
        problems: [error instanceof Error ? error.message : 'Unbekannter Fehler'],
        suggestions: ['Bitte versuchen Sie es erneut']
      })
    }
  }

  // Calculate overall score
  const overallScore = calculateOverallScore(checkResults)
  const overallStatus = getStatusFromScore(overallScore)

  const duration = Date.now() - startTime

  return {
    overallScore,
    overallStatus,
    summary: generateSummary(overallScore, overallStatus, checkResults),
    checks: checkResults,
    timestamp: new Date(),
    inputText: input.text,
    inputImage: input.image ? (typeof input.image === 'string' ? input.image : undefined) : undefined
  }
}

/**
 * Run a single check
 */
async function runCheck(
  checkId: number,
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<CheckResult> {
  const checkDef = CHECK_DEFINITIONS[checkId - 1]

  switch (checkId) {
    case 1:
      return await checkValueAlignment(input, provider, model, apiKey)
    case 2:
      return await checkTargetAudience(input, provider, model, apiKey)
    case 3:
      return await checkStoryQuality(input, provider, model, apiKey)
    case 4:
      return await checkATEStructure(input, provider, model, apiKey)
    case 5:
      return await checkMessageClarity(input, provider, model, apiKey)
    case 6:
      return await checkActorAnalysis(input, provider, model, apiKey)
    case 7:
      return await checkMarginalizedGroups(input, provider, model, apiKey)
    case 8:
      return await checkDiversity(input, provider, model, apiKey)
    case 9:
      return await checkHumanComplexity(input, provider, model, apiKey)
    case 10:
      return await checkActionBalance(input, provider, model, apiKey)
    case 11:
      return await checkNormsAndValues(input, provider, model, apiKey)
    case 12:
      return await checkInclusiveLanguage(input, provider, model, apiKey)
    case 13:
      return await checkControversyHandling(input, provider, model, apiKey)
    case 14:
      return await checkParticipation(input, provider, model, apiKey)
    default:
      throw new Error(`Unknown check ID: ${checkId}`)
  }
}

// ============================================
// CHECK 1: Wertekongruenz (Value Alignment)
// ============================================
async function checkValueAlignment(
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<CheckResult> {
  const orgValues = input.organizationSettings?.values?.join(', ') || 'keine spezifischen Werte angegeben'
  const orgName = input.organizationSettings?.name || 'die Organisation'

  const prompt = `
Du bist ein Experte für demokratisches Storytelling und analysierst einen Social Media Post.

**AUFGABE:** Prüfe, ob die Sprache und Tonalität des Posts zu den angegebenen Organisationswerten passt.

**ORGANISATIONSWERTE:** ${orgValues}
**ORGANISATION:** ${orgName}

**POST-TEXT:**
"""
${input.text}
"""

**ANALYSE-KRITERIEN:**
1. Tonalität (formal, nahbar, distanziert, empathisch, sachlich)
2. Verwendete Begriffe und ihre emotionale Ladung
3. Grammatikalische Strukturen (aktiv, passiv, imperativ)
4. Konsistenz mit den angegebenen Werten
5. Authentizität und Glaubwürdigkeit

**AUSGABE-FORMAT (JSON):**
Antworte NUR mit einem validen JSON-Objekt in diesem Format:
{
  "score": <Zahl zwischen 0 und 100>,
  "status": "<gut, verbesserungswürdig oder problematisch>",
  "tonality": "<Beschreibung der Tonalität>",
  "alignment": "<Wie gut passt es zu den Werten>",
  "problems": [<Liste von erkannten Problemen als Strings>],
  "suggestions": [<Liste konkreter Verbesserungsvorschläge als Strings>],
  "alternativeFormulation": "<Optional: Bessere Formulierung eines Satzes>"
}

WICHTIG: Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne zusätzlichen Text davor oder danach.
`

  const response = await callLLM(provider, model, apiKey, prompt)

  if (response.error) {
    throw new Error(response.error)
  }

  const result = parseCheckResponse(response.content, 1, 'Wertekongruenz')
  return result
}

// ============================================
// CHECK 2: Zielgruppenpassung (Target Audience)
// ============================================
async function checkTargetAudience(
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<CheckResult> {
  const audienceNames: Record<TargetAudience, string> = {
    spender: 'Spender*innen',
    politik: 'Politik/Entscheider*innen',
    community: 'Community/Mitglieder',
    medien: 'Medien',
    oeffentlichkeit: 'Allgemeine Öffentlichkeit',
    custom: input.targetAudience === 'custom' ? 'Benutzerdefiniert' : 'Allgemeine Öffentlichkeit'
  }

  const targetAudienceStr = audienceNames[input.targetAudience]

  const prompt = `
Du bist ein Experte für demokratisches Storytelling und analysierst einen Social Media Post.

**AUFGABE:** Prüfe, ob die Sprache und Komplexität des Posts zur avisierten Zielgruppe passt.

**ZIELGRUPPE:** ${targetAudienceStr}

**POST-TEXT:**
"""
${input.text}
"""

**ANALYSE-KRITERIEN:**
1. Sprachregister (Fachsprache, Alltagssprache, Jugendsprache)
2. Satzkomplexität und Verständlichkeit
3. Verwendete Begriffe und deren Zugänglichkeit
4. Call-to-Action passend für Zielgruppe
5. Ansprache und Ton

**AUSGABE-FORMAT (JSON):**
Antworte NUR mit einem validen JSON-Objekt in diesem Format:
{
  "score": <Zahl zwischen 0 und 100>,
  "status": "<gut, verbesserungswürdig oder problematisch>",
  "languageLevel": "<Beschreibung des Sprachregisters>",
  "complexity": "<Einschätzung der Komplexität>",
  "problems": [<Liste von erkannten Problemen>],
  "suggestions": [<Liste konkreter Verbesserungsvorschläge>],
  "alternativeFormulation": "<Optional: Bessere Formulierung>"
}

WICHTIG: Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne zusätzlichen Text.
`

  const response = await callLLM(provider, model, apiKey, prompt)

  if (response.error) {
    throw new Error(response.error)
  }

  return parseCheckResponse(response.content, 2, 'Zielgruppenpassung')
}

// ============================================
// CHECK 3: Geschichten-Qualität (Story Quality)
// ============================================
async function checkStoryQuality(
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<CheckResult> {
  const prompt = `
Du bist ein Experte für demokratisches Storytelling und analysierst einen Social Media Post.

**AUFGABE:** Prüfe, ob der Post eine authentische, nachvollziehbare Geschichte erzählt.

**POST-TEXT:**
"""
${input.text}
"""

**ANALYSE-KRITERIEN:**
1. Sind Figuren/Personen vorhanden und konkret dargestellt?
2. Gibt es Konflikte/Probleme/Dilemmata?
3. Wird eine Lösung/Transformation gezeigt?
4. Ist die Geschichte nachvollziehbar und authentisch?
5. Emotionale Resonanz und Identifikationspotential

**AUSGABE-FORMAT (JSON):**
Antworte NUR mit einem validen JSON-Objekt in diesem Format:
{
  "score": <Zahl zwischen 0 und 100>,
  "status": "<gut, verbesserungswürdig oder problematisch>",
  "hasCharacters": <true/false>,
  "hasConflict": <true/false>,
  "hasSolution": <true/false>,
  "authenticity": "<Einschätzung der Authentizität>",
  "problems": [<Liste von erkannten Problemen>],
  "suggestions": [<Liste konkreter Verbesserungsvorschläge>]
}

WICHTIG: Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne zusätzlichen Text.
`

  const response = await callLLM(provider, model, apiKey, prompt)

  if (response.error) {
    throw new Error(response.error)
  }

  return parseCheckResponse(response.content, 3, 'Geschichten-Qualität')
}

// ============================================
// CHECK 4: ATE-Struktur (ATE Structure)
// ============================================
async function checkATEStructure(
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<CheckResult> {
  const prompt = `
Du bist ein Experte für demokratisches Storytelling und analysierst einen Social Media Post.

**AUFGABE:** Prüfe, ob der Post dem ATE-Schema folgt (Ausgangszustand → Transformation → Endzustand).

**POST-TEXT:**
"""
${input.text}
"""

**ANALYSE-KRITERIEN:**
1. **A (Ausgangszustand):** Wird die Ausgangssituation/das Problem beschrieben?
2. **T (Transformation):** Wird ein Ereignis/eine Intervention/ein Wendepunkt dargestellt?
3. **E (Endzustand):** Wird die Lösung/das Ergebnis/die Veränderung gezeigt?
4. Vollständigkeit und Klarheit der Struktur
5. Logischer Zusammenhang zwischen den Teilen

**AUSGABE-FORMAT (JSON):**
Antworte NUR mit einem validen JSON-Objekt in diesem Format:
{
  "score": <Zahl zwischen 0 und 100>,
  "status": "<gut, verbesserungswürdig oder problematisch>",
  "hasAusgangszustand": <true/false>,
  "hasTransformation": <true/false>,
  "hasEndzustand": <true/false>,
  "structureQuality": "<Beschreibung der Strukturqualität>",
  "problems": [<Liste von erkannten Problemen>],
  "suggestions": [<Liste konkreter Verbesserungsvorschläge>]
}

WICHTIG: Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne zusätzlichen Text.
`

  const response = await callLLM(provider, model, apiKey, prompt)

  if (response.error) {
    throw new Error(response.error)
  }

  return parseCheckResponse(response.content, 4, 'Narrative Struktur (ATE)')
}

// ============================================
// CHECK 5: Botschaft-Klarheit (Message Clarity)
// ============================================
async function checkMessageClarity(
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<CheckResult> {
  const prompt = `
Du bist ein Experte für demokratisches Storytelling und analysierst einen Social Media Post.

**AUFGABE:** Identifiziere die Kern-Botschaft und prüfe deren Klarheit.

**POST-TEXT:**
"""
${input.text}
"""

**ANALYSE-KRITERIEN:**
1. Was ist die Haupt-Botschaft? (In einem Satz)
2. Ist die Botschaft klar und eindeutig erkennbar?
3. Ist sie wiederholbar/merkbar?
4. Positiv oder negativ formuliert?
5. Handlungsorientierung vorhanden?

**AUSGABE-FORMAT (JSON):**
Antworte NUR mit einem validen JSON-Objekt in diesem Format:
{
  "score": <Zahl zwischen 0 und 100>,
  "status": "<gut, verbesserungswürdig oder problematisch>",
  "coreMessage": "<Die identifizierte Kern-Botschaft in einem Satz>",
  "clarity": "<Einschätzung der Klarheit>",
  "isPositive": <true/false>,
  "isActionOriented": <true/false>,
  "problems": [<Liste von erkannten Problemen>],
  "suggestions": [<Liste konkreter Verbesserungsvorschläge>],
  "alternativeFormulation": "<Optional: Klarere Formulierung der Botschaft>"
}

WICHTIG: Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne zusätzlichen Text.
`

  const response = await callLLM(provider, model, apiKey, prompt)

  if (response.error) {
    throw new Error(response.error)
  }

  return parseCheckResponse(response.content, 5, 'Botschaft-Klarheit')
}

// ============================================
// CHECK 6: Akteur-Analyse (Actor Analysis)
// ============================================
async function checkActorAnalysis(
  input: AnalysisInput,
  provider: LLMProvider,
  model: LLMModel,
  apiKey: string
): Promise<CheckResult> {
  const prompt = `
Du bist ein Experte für demokratisches Storytelling und analysierst einen Social Media Post.

**AUFGABE:** Analysiere, welche Akteure vorkommen und in welcher Rolle sie dargestellt werden.

**POST-TEXT:**
"""
${input.text}
"""

**ANALYSE-KRITERIEN:**
1. Welche Akteure/Gruppen kommen vor?
2. Werden sie aktiv oder passiv dargestellt?
3. Haben sie Handlungsfähigkeit (agency)?
4. Gibt es Machtgefälle in der Darstellung?
5. Werden Menschen als Empfänger oder als Handelnde gezeigt?

**AUSGABE-FORMAT (JSON):**
Antworte NUR mit einem validen JSON-Objekt in diesem Format:
{
  "score": <Zahl zwischen 0 und 100>,
  "status": "<gut, verbesserungswürdig oder problematisch>",
  "actors": [
    {
      "name": "<Name/Gruppe>",
      "role": "<aktiv/passiv>",
      "hasAgency": <true/false>
    }
  ],
  "powerBalance": "<Beschreibung des Machtgefälles>",
  "problems": [<Liste von erkannten Problemen>],
  "suggestions": [<Liste konkreter Verbesserungsvorschläge>]
}

WICHTIG: Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne zusätzlichen Text.
`

  const response = await callLLM(provider, model, apiKey, prompt)

  if (response.error) {
    throw new Error(response.error)
  }

  return parseCheckResponse(response.content, 6, 'Akteur-Analyse')
}

// ============================================
// CHECKS 7-14: Stubs for now (will implement later)
// ============================================

async function checkMarginalizedGroups(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  // TODO: Implement full check
  return {
    checkId: 7,
    checkName: 'Marginalisierte Gruppen',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

async function checkDiversity(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  return {
    checkId: 8,
    checkName: 'Diversitäts-Check',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

async function checkHumanComplexity(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  return {
    checkId: 9,
    checkName: 'Komplexität der Menschen',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

async function checkActionBalance(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  return {
    checkId: 10,
    checkName: 'Handlungs-Balance',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

async function checkNormsAndValues(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  return {
    checkId: 11,
    checkName: 'Normen und Werte',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

async function checkInclusiveLanguage(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  return {
    checkId: 12,
    checkName: 'Inklusiver Sprachgebrauch',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

async function checkControversyHandling(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  return {
    checkId: 13,
    checkName: 'Kontroversen-Umgang',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

async function checkParticipation(input: AnalysisInput, provider: LLMProvider, model: LLMModel, apiKey: string): Promise<CheckResult> {
  return {
    checkId: 14,
    checkName: 'Partizipations-Möglichkeiten',
    score: 70,
    status: 'verbesserungswürdig',
    analysis: 'Dieser Check wird in Kürze vollständig implementiert.',
    problems: ['Noch nicht vollständig implementiert'],
    suggestions: ['Check wird in der nächsten Version verfügbar sein']
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse LLM response and convert to CheckResult
 */
function parseCheckResponse(content: string, checkId: number, checkName: string): CheckResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      checkId,
      checkName,
      score: parsed.score || 0,
      status: parsed.status || 'problematisch',
      analysis: parsed.alignment || parsed.complexity || parsed.authenticity || parsed.structureQuality || parsed.clarity || parsed.powerBalance || 'Analyse durchgeführt',
      problems: parsed.problems || [],
      suggestions: parsed.suggestions || [],
      alternativeFormulation: parsed.alternativeFormulation,
      details: parsed
    }
  } catch (error) {
    console.error('Error parsing check response:', error)
    console.error('Content:', content)

    // Return fallback result
    return {
      checkId,
      checkName,
      score: 50,
      status: 'verbesserungswürdig',
      analysis: 'Analyse konnte nicht vollständig durchgeführt werden',
      problems: ['Fehler beim Parsen der Analyse-Ergebnisse'],
      suggestions: ['Bitte versuchen Sie es erneut']
    }
  }
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(checks: CheckResult[]): number {
  if (checks.length === 0) return 0

  let totalWeightedScore = 0
  let totalWeight = 0

  for (const check of checks) {
    const weight = CHECK_DEFINITIONS[check.checkId - 1].weight
    totalWeightedScore += check.score * weight
    totalWeight += weight
  }

  return Math.round(totalWeightedScore / totalWeight)
}

/**
 * Get status from score
 */
function getStatusFromScore(score: number): CheckStatus {
  if (score >= 80) return 'gut'
  if (score >= 60) return 'verbesserungswürdig'
  return 'problematisch'
}

/**
 * Generate summary text
 */
function generateSummary(score: number, status: CheckStatus, checks: CheckResult[]): string {
  const statusTexts: Record<CheckStatus, string> = {
    gut: 'Ihr Post ist demokratisch und inklusiv formuliert. Die meisten Kriterien werden gut erfüllt.',
    verbesserungswürdig: 'Ihr Post hat Potential, könnte aber in einigen Bereichen verbessert werden.',
    problematisch: 'Ihr Post sollte in mehreren Bereichen überarbeitet werden, um demokratischer und inklusiver zu werden.'
  }

  const goodChecks = checks.filter(c => c.status === 'gut').length
  const totalChecks = checks.length

  return `${statusTexts[status]} ${goodChecks} von ${totalChecks} Checks sind gut.`
}

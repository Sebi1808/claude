import { Criterion, TextAnalysisResult, CriterionResult } from '@/types'

export function analyzeText(text: string, criteria: Criterion[]): TextAnalysisResult {
  const activeCriteria = criteria.filter(c => c.enabled && c.category === 'text')
  const criteriaResults: CriterionResult[] = []
  const suggestions: string[] = []

  activeCriteria.forEach(criterion => {
    const result = evaluateCriterion(text, criterion)
    criteriaResults.push(result)

    if (!result.passed && result.feedback) {
      suggestions.push(result.feedback)
    }
  })

  // Gewichtete Gesamtbewertung berechnen
  const totalWeight = activeCriteria.reduce((sum, c) => sum + c.weight, 0)
  const weightedScore = criteriaResults.reduce((sum, r) => {
    const criterion = activeCriteria.find(c => c.id === r.criterionId)
    return sum + (r.score * (criterion?.weight || 1))
  }, 0)

  const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0
  const passed = finalScore >= 60

  return {
    score: finalScore,
    criteriaResults,
    suggestions,
    passed,
  }
}

function evaluateCriterion(text: string, criterion: Criterion): CriterionResult {
  switch (criterion.id) {
    case 'text-length':
      return evaluateTextLength(text, criterion)
    case 'text-hashtags':
      return evaluateHashtags(text, criterion)
    case 'text-emoji':
      return evaluateEmojis(text, criterion)
    case 'text-readability':
      return evaluateReadability(text, criterion)
    case 'text-cta':
      return evaluateCTA(text, criterion)
    case 'text-tone':
      return evaluateTone(text, criterion)
    default:
      return {
        criterionId: criterion.id,
        criterionName: criterion.name,
        passed: true,
        score: 100,
        feedback: 'Kriterium konnte nicht bewertet werden',
      }
  }
}

function evaluateTextLength(text: string, criterion: Criterion): CriterionResult {
  const length = text.length
  let score = 100
  let feedback = ''
  let passed = true

  if (length < 50) {
    score = 40
    passed = false
    feedback = `Text ist zu kurz (${length} Zeichen). Empfohlen: 100-280 Zeichen für maximale Engagement.`
  } else if (length < 100) {
    score = 70
    feedback = `Text könnte etwas länger sein (${length} Zeichen). Optimal: 100-280 Zeichen.`
  } else if (length > 280) {
    score = 60
    feedback = `Text ist etwas lang (${length} Zeichen). Für Social Media besser: 100-280 Zeichen.`
  } else {
    feedback = `Perfekte Textlänge (${length} Zeichen) für Social Media!`
  }

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateHashtags(text: string, criterion: Criterion): CriterionResult {
  const hashtags = text.match(/#\w+/g) || []
  const count = hashtags.length
  let score = 100
  let feedback = ''
  let passed = true

  if (count === 0) {
    score = 50
    passed = false
    feedback = 'Keine Hashtags gefunden. Fügen Sie 2-5 relevante Hashtags hinzu, um die Reichweite zu erhöhen.'
  } else if (count === 1) {
    score = 70
    feedback = 'Nur 1 Hashtag gefunden. Verwenden Sie 2-5 Hashtags für optimale Reichweite.'
  } else if (count >= 2 && count <= 5) {
    feedback = `Perfekt! ${count} Hashtags sind ideal für Social Media.`
  } else {
    score = 60
    feedback = `Zu viele Hashtags (${count}). Beschränken Sie sich auf 2-5 relevante Hashtags.`
  }

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateEmojis(text: string, criterion: Criterion): CriterionResult {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  const emojis = text.match(emojiRegex) || []
  const count = emojis.length
  let score = 100
  let feedback = ''
  let passed = true

  if (count === 0) {
    score = 70
    feedback = 'Keine Emojis verwendet. 1-3 passende Emojis können den Text auflockern.'
  } else if (count >= 1 && count <= 3) {
    feedback = `Gute Emoji-Verwendung (${count}). Der Text wirkt freundlich und zugänglich.`
  } else {
    score = 60
    feedback = `Zu viele Emojis (${count}). Beschränken Sie sich auf 1-3 für einen professionellen Eindruck.`
  }

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateReadability(text: string, criterion: Criterion): CriterionResult {
  let score = 100
  let feedback = ''
  let passed = true

  // Prüfe auf sehr lange Sätze
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const longSentences = sentences.filter(s => s.length > 150)

  // Prüfe auf wiederholte Wörter
  const words = text.toLowerCase().split(/\s+/)
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    if (word.length > 4) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  })
  const repeatedWords = Object.entries(wordCount).filter(([_, count]) => count > 3)

  if (longSentences.length > 0) {
    score -= 20
    feedback = 'Text enthält sehr lange Sätze. Kürzen Sie diese für bessere Lesbarkeit.'
  }

  if (repeatedWords.length > 0) {
    score -= 15
    feedback += (feedback ? ' ' : '') + 'Einige Wörter werden zu oft wiederholt. Variieren Sie Ihre Formulierungen.'
  }

  if (!feedback) {
    feedback = 'Text ist gut strukturiert und leicht lesbar.'
  }

  passed = score >= 70

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateCTA(text: string, criterion: Criterion): CriterionResult {
  const ctaKeywords = [
    'jetzt', 'heute', 'klick', 'besuch', 'schau', 'erfahre', 'entdecke',
    'hol', 'sichere', 'registrier', 'melde', 'teste', 'probiere', 'nutze',
    'mehr erfahren', 'weiterlesen', 'link in bio', 'swipe up'
  ]

  const lowerText = text.toLowerCase()
  const hasCTA = ctaKeywords.some(keyword => lowerText.includes(keyword))

  // Prüfe auf Fragezeichen (können auch aktivierend sein)
  const hasQuestion = text.includes('?')

  let score = 100
  let feedback = ''
  let passed = true

  if (hasCTA) {
    feedback = 'Gut! Text enthält eine klare Call-to-Action.'
  } else if (hasQuestion) {
    score = 75
    feedback = 'Text stellt eine Frage, könnte aber eine direktere Handlungsaufforderung enthalten.'
  } else {
    score = 50
    passed = false
    feedback = 'Keine Call-to-Action gefunden. Fügen Sie eine Handlungsaufforderung hinzu (z.B. "Jetzt entdecken", "Mehr erfahren").'
  }

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateTone(text: string, criterion: Criterion): CriterionResult {
  let score = 100
  let feedback = ''
  let passed = true

  // Prüfe auf übermäßige Großschreibung
  const capsWords = text.match(/\b[A-ZÄÖÜ]{4,}\b/g) || []

  // Prüfe auf zu viele Ausrufezeichen
  const exclamationMarks = (text.match(/!/g) || []).length

  // Prüfe auf unprofessionelle Wörter
  const unprofessionalWords = ['krass', 'mega', 'hammer', 'geil', 'krank', 'fett']
  const hasUnprofessional = unprofessionalWords.some(word =>
    text.toLowerCase().includes(word)
  )

  if (capsWords.length > 2) {
    score -= 25
    feedback = 'Zu viele Wörter in Großbuchstaben wirken wie Schreien.'
  }

  if (exclamationMarks > 3) {
    score -= 20
    feedback += (feedback ? ' ' : '') + 'Zu viele Ausrufezeichen (!) reduzieren die Professionalität.'
  }

  if (hasUnprofessional) {
    score -= 15
    feedback += (feedback ? ' ' : '') + 'Vermeiden Sie zu umgangssprachliche Ausdrücke für einen professionellen Eindruck.'
  }

  if (!feedback) {
    feedback = 'Tonalität ist professionell und markenkonform.'
  }

  passed = score >= 70

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

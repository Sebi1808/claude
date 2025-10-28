import { Criterion, ImageAnalysisResult, CriterionResult } from '@/types'

export function analyzeImage(imageData: string, criteria: Criterion[]): ImageAnalysisResult {
  const activeCriteria = criteria.filter(c => c.enabled && c.category === 'image')
  const criteriaResults: CriterionResult[] = []
  const suggestions: string[] = []

  // Basis-Bildanalyse
  const imageInfo = extractImageInfo(imageData)

  activeCriteria.forEach(criterion => {
    const result = evaluateCriterion(imageInfo, criterion)
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
    imageData,
  }
}

interface ImageInfo {
  width: number
  height: number
  aspectRatio: number
  fileSize: number
  format: string
}

function extractImageInfo(imageData: string): ImageInfo {
  // Extrahiere Basis-Informationen aus dem Base64-String
  const format = imageData.split(';')[0].split('/')[1] || 'unknown'

  // Schätze Dateigröße (Base64 ist ~33% größer als Original)
  const base64Length = imageData.split(',')[1]?.length || 0
  const fileSize = Math.round((base64Length * 3) / 4)

  // Da wir im Backend sind, können wir die tatsächlichen Dimensionen nicht ohne
  // zusätzliche Libraries ermitteln. Für Demo-Zwecke verwenden wir Platzhalter.
  // In einer Produktionsumgebung würde man hier eine Bibliothek wie 'sharp' verwenden.

  return {
    width: 1920, // Platzhalter
    height: 1080, // Platzhalter
    aspectRatio: 16 / 9,
    fileSize,
    format,
  }
}

function evaluateCriterion(imageInfo: ImageInfo, criterion: Criterion): CriterionResult {
  switch (criterion.id) {
    case 'image-quality':
      return evaluateImageQuality(imageInfo, criterion)
    case 'image-branding':
      return evaluateBranding(imageInfo, criterion)
    case 'image-composition':
      return evaluateComposition(imageInfo, criterion)
    case 'image-text':
      return evaluateTextInImage(imageInfo, criterion)
    case 'image-format':
      return evaluateFormat(imageInfo, criterion)
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

function evaluateImageQuality(imageInfo: ImageInfo, criterion: Criterion): CriterionResult {
  let score = 100
  let feedback = ''
  let passed = true

  const minWidth = 1080
  const minHeight = 1080

  if (imageInfo.width < minWidth || imageInfo.height < minHeight) {
    score = 50
    passed = false
    feedback = `Bildauflösung ist zu niedrig (${imageInfo.width}x${imageInfo.height}). Empfohlen: mindestens ${minWidth}x${minHeight} Pixel für gute Qualität auf Social Media.`
  } else if (imageInfo.width >= 1920 && imageInfo.height >= 1080) {
    feedback = `Ausgezeichnete Bildqualität (${imageInfo.width}x${imageInfo.height} Pixel)!`
  } else {
    score = 80
    feedback = `Gute Bildqualität (${imageInfo.width}x${imageInfo.height} Pixel). Für beste Ergebnisse: 1920x1080 oder höher.`
  }

  // Prüfe Dateigröße
  const maxSize = 5 * 1024 * 1024 // 5 MB
  if (imageInfo.fileSize > maxSize) {
    score -= 15
    feedback += ' Dateigröße ist sehr hoch, komprimieren Sie das Bild für schnellere Ladezeiten.'
  }

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateBranding(imageInfo: ImageInfo, criterion: Criterion): CriterionResult {
  // In einer echten Implementierung würde hier eine KI-basierte Bilderkennung
  // nach Logos und Markenelementen suchen

  let score = 75
  let feedback = 'Hinweis: Prüfen Sie manuell, ob Ihr Logo oder Markenelemente gut sichtbar sind.'
  let passed = true

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateComposition(imageInfo: ImageInfo, criterion: Criterion): CriterionResult {
  // In einer echten Implementierung würde hier eine KI-Analyse
  // der Bildkomposition durchgeführt

  let score = 80
  let feedback = 'Tipp: Achten Sie auf die Drittel-Regel und einen klaren Fokuspunkt im Bild.'
  let passed = true

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateTextInImage(imageInfo: ImageInfo, criterion: Criterion): CriterionResult {
  // In einer echten Implementierung würde hier OCR verwendet,
  // um Text im Bild zu erkennen und dessen Anteil zu messen

  let score = 85
  let feedback = 'Hinweis: Stellen Sie sicher, dass Text im Bild gut lesbar ist und max. 20% der Fläche einnimmt (Facebook-Richtlinie).'
  let passed = true

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

function evaluateFormat(imageInfo: ImageInfo, criterion: Criterion): CriterionResult {
  let score = 100
  let feedback = ''
  let passed = true

  const ratio = imageInfo.aspectRatio

  // Prüfe auf gängige Social Media Formate
  const isSquare = Math.abs(ratio - 1) < 0.1 // 1:1
  const isLandscape = Math.abs(ratio - 16/9) < 0.1 // 16:9
  const isPortrait = Math.abs(ratio - 9/16) < 0.1 // 9:16 (Stories)
  const is4to5 = Math.abs(ratio - 4/5) < 0.1 // 4:5 (Instagram Feed)

  if (isSquare) {
    feedback = 'Perfekt! Quadratisches Format (1:1) ist ideal für Instagram und Facebook.'
  } else if (isLandscape) {
    feedback = 'Gut! Landscape-Format (16:9) ist ideal für YouTube und LinkedIn.'
  } else if (isPortrait) {
    feedback = 'Super! Portrait-Format (9:16) ist perfekt für Instagram/Facebook Stories und TikTok.'
  } else if (is4to5) {
    feedback = 'Sehr gut! 4:5 Format ist optimal für Instagram Feed Posts.'
  } else {
    score = 65
    feedback = `Ungewöhnliches Seitenverhältnis (${ratio.toFixed(2)}:1). Empfohlen: 1:1 (quadratisch), 4:5, 16:9 oder 9:16 für beste Social Media Darstellung.`
  }

  // Prüfe Bildformat
  const goodFormats = ['jpeg', 'jpg', 'png', 'webp']
  if (!goodFormats.includes(imageInfo.format.toLowerCase())) {
    score -= 10
    feedback += ` Format ${imageInfo.format} könnte Kompatibilitätsprobleme verursachen. Besser: JPEG, PNG oder WebP.`
  }

  return {
    criterionId: criterion.id,
    criterionName: criterion.name,
    passed,
    score,
    feedback,
  }
}

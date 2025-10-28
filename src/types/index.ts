export interface Criterion {
  id: string
  name: string
  description: string
  category: 'text' | 'image' | 'both'
  enabled: boolean
  weight: number // 1-10
}

export interface TextAnalysisResult {
  score: number // 0-100
  criteriaResults: CriterionResult[]
  suggestions: string[]
  passed: boolean
}

export interface ImageAnalysisResult {
  score: number // 0-100
  criteriaResults: CriterionResult[]
  suggestions: string[]
  passed: boolean
  imageData?: string
}

export interface CriterionResult {
  criterionId: string
  criterionName: string
  passed: boolean
  score: number
  feedback: string
}

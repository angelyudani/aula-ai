/** Frontend session models. These are not the server API contracts. */
export type StudentTopic = 'suma' | 'resta' | 'multiplicacion' | 'fracciones'

export type TopicResult = {
  topic: StudentTopic
  correct: number
  incorrect: number
  percentage: number
  level: 'Dominado' | 'En práctica' | 'Necesita apoyo'
}

export type DiagnosticReport = {
  studentId: string
  studentName: string
  completedAt: string
  topics: TopicResult[]
  answers: Record<string, string>
  source: 'mock' | 'api'
}

export type PracticeStats = {
  /** Distinct practice questions solved correctly. */
  completed: number
  /** Correct answer submissions. */
  correct: number
  /** Incorrect answer submissions; a question can have multiple attempts. */
  incorrect: number
  attempts: number
  completedExerciseIds: string[]
  updatedAt: string | null
}

export const initialPracticeStats: PracticeStats = {
  completed: 0,
  correct: 0,
  incorrect: 0,
  attempts: 0,
  completedExerciseIds: [],
  updatedAt: null,
}

export const topicLabels: Record<StudentTopic, string> = {
  suma: 'Suma',
  resta: 'Resta',
  multiplicacion: 'Multiplicación',
  fracciones: 'Fracciones',
}

/** The deterministic mock chooses the lowest diagnostic percentage. */
export function weakestTopic(topics: TopicResult[]): StudentTopic {
  return [...topics].sort((a, b) => a.percentage - b.percentage)[0]?.topic ?? 'fracciones'
}

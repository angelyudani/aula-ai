import { Router, type Request, type Response } from 'express'
import { supabase } from '../db/supabaseClient'
import { getDemoStudentName } from '../data/demoStudentNames'

type DiagnosticRow = {
  student_id: string
  topic: string
  score: number
  created_at: string
}

const router = Router()
const topics = ['suma', 'resta', 'multiplicacion', 'fracciones'] as const

router.get('/teacher/summary', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('diagnostic_results')
    .select('student_id, topic, score, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al leer el resumen docente de Supabase:', error.message)
    return res.status(500).json({ error: 'No se pudo cargar el resumen del grupo' })
  }

  const latestByStudent = new Map<string, Map<string, number>>()
  const lastCompletedAt = new Map<string, string>()
  for (const row of (data ?? []) as DiagnosticRow[]) {
    if (!row.student_id || !Number.isFinite(Number(row.score))) continue
    const studentTopics = latestByStudent.get(row.student_id) ?? new Map<string, number>()
    const topic = row.topic === 'fracciones_suma' ? 'fracciones' : row.topic
    if (!studentTopics.has(topic)) studentTopics.set(topic, Number(row.score))
    latestByStudent.set(row.student_id, studentTopics)
    if (!lastCompletedAt.has(row.student_id)) lastCompletedAt.set(row.student_id, row.created_at)
  }

  const students = [...latestByStudent.entries()].map(([id, scores]) => {
    const topicScores = Object.fromEntries(scores) as Record<string, number>
    const values = [...scores.values()]
    const averageScore = values.length ? Math.round(values.reduce((sum, score) => sum + score, 0) / values.length) : 0
    const weakestTopic = values.length
      ? [...scores.entries()].sort((a, b) => a[1] - b[1])[0][0]
      : 'fracciones'
    return {
      id,
      name: getDemoStudentName(id),
      group: '2° A',
      averageScore,
      scoresByTopic: topicScores,
      weakestTopic,
      completedAt: lastCompletedAt.get(id) ?? null,
    }
  })

  const topicFailureRates = topics.map((topic) => {
    const assessed = students.filter((student) => typeof student.scoresByTopic[topic] === 'number')
    const failures = assessed.filter((student) => student.scoresByTopic[topic] < 60).length
    return {
      topic,
      failurePercentage: assessed.length ? Math.round((failures / assessed.length) * 100) : 0,
    }
  })

  const studentsAtRisk = students
    .filter((student) => student.averageScore < 60)
    .map(({ id, name, weakestTopic, averageScore }) => ({
      id,
      name,
      weakestTopic,
      score: averageScore,
    }))

  const averageScore = students.length
    ? Math.round(students.reduce((sum, student) => sum + student.averageScore, 0) / students.length)
    : 0

  return res.json({
    totalStudents: students.length,
    averageScore,
    topicFailureRates,
    studentsAtRisk,
    students,
  })
})

export default router

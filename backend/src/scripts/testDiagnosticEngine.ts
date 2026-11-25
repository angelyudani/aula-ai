import assert from 'node:assert/strict'
import { mathQuestions } from '../data/mathQuestions'
import { evaluateDiagnostic } from '../services/diagnosticEngine'

const expectedTopics = ['suma', 'resta', 'multiplicacion', 'fracciones']
assert.equal(mathQuestions.length, 12, 'El diagnóstico debe tener 12 preguntas')
assert.deepEqual([...new Set(mathQuestions.map((question) => question.topic))], expectedTopics)

const perfectResult = evaluateDiagnostic('alum-demo-45', mathQuestions.map((question) => ({
  questionId: question.id,
  answer: question.correctAnswer,
})))
assert.deepEqual(perfectResult.scoresByTopic, {
  suma: 100,
  resta: 100,
  multiplicacion: 100,
  fracciones: 100,
})
assert.equal(perfectResult.detectedMistakes.length, 0)

const emptyResult = evaluateDiagnostic('alum-demo-45', [])
assert.deepEqual(emptyResult.scoresByTopic, {
  suma: 0,
  resta: 0,
  multiplicacion: 0,
  fracciones: 0,
})
assert.equal(emptyResult.detectedMistakes.length, 12)

console.log('PASS: 12 preguntas, cuatro temas y calificación de respuestas correctas/vacías.')

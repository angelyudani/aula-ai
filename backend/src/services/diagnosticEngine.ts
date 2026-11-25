import { mathQuestions, type DiagnosticTopic } from '../data/mathQuestions';

export interface StudentAnswer {
  questionId: string;
  answer: string;
}

export interface DetectedMistake {
  questionId: string;
  prompt: string;
  studentAnswer: string;
  errorPattern: string;
}

export function evaluateDiagnostic(studentId: string, answers: StudentAnswer[]) {
  const topicStats = new Map<DiagnosticTopic, { correct: number; total: number }>();
  for (const question of mathQuestions) {
    const stats = topicStats.get(question.topic) ?? { correct: 0, total: 0 };
    stats.total += 1;
    topicStats.set(question.topic, stats);
  }

  const detectedMistakes: DetectedMistake[] = [];

  for (const question of mathQuestions) {
    const submitted = answers.find((a) => a.questionId === question.id);
    const cleanAnswer = submitted ? submitted.answer.trim() : '';

    if (cleanAnswer === question.correctAnswer) {
      const stats = topicStats.get(question.topic);
      if (stats) stats.correct += 1;
    } else {
      const pattern = question.commonMistakes[cleanAnswer] || 'error_procedimiento_general';
      detectedMistakes.push({
        questionId: question.id,
        prompt: question.prompt,
        studentAnswer: cleanAnswer || 'sin_respuesta',
        errorPattern: pattern
      });
    }
  }

  const scoresByTopic: Record<string, number> = {};
  let weakestTopic = 'fracciones_suma';
  let lowestScore = 101;

  for (const [topic, stat] of topicStats) {
    const percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    scoresByTopic[topic] = percentage;

    if (percentage < lowestScore) {
      lowestScore = percentage;
      weakestTopic = topic;
    }
  }

  return { studentId, scoresByTopic, weakestTopic, detectedMistakes };
}

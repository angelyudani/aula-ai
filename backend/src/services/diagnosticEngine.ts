import { mathQuestions } from '../data/mathQuestions';

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
  const topicStats: Record<string, { correct: number; total: number }> = {
    multiplicacion: { correct: 0, total: 0 },
    fracciones_suma: { correct: 0, total: 0 }
  };

  const detectedMistakes: DetectedMistake[] = [];

  for (const question of mathQuestions) {
    topicStats[question.topic].total += 1;
    const submitted = answers.find((a) => a.questionId === question.id);
    const cleanAnswer = submitted ? submitted.answer.trim() : '';

    if (cleanAnswer === question.correctAnswer) {
      topicStats[question.topic].correct += 1;
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

  for (const [topic, stat] of Object.entries(topicStats)) {
    const percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    scoresByTopic[topic] = percentage;

    if (percentage < lowestScore) {
      lowestScore = percentage;
      weakestTopic = topic;
    }
  }

  return { studentId, scoresByTopic, weakestTopic, detectedMistakes };
}
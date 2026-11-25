export interface DetectedMistake {
  questionId: string;
  prompt: string;
  studentAnswer: string;
  errorPattern: string;
}

export interface DiagnosticRequest {
  studentId: string;
  answers: { questionId: string; answer: string }[];
}

export interface DiagnosticResponse {
  studentId: string;
  scoresByTopic: Record<string, number>;
  weakestTopic: string;
  detectedMistakes: DetectedMistake[];
}

export interface TutorHintRequest {
  questionId: string;
  questionPrompt: string;
  studentAnswer: string;
  errorPattern?: string;
  hintLevel: 1 | 2 | 3;
}

export interface TutorHintResponse {
  hintLevel: 1 | 2 | 3;
  message: string;
  source: 'ai' | 'fallback';
}

export interface ReadingSubmitRequest {
  studentId: string;
  textId: string;
  selectedOption: string;
  evidenceSentenceIndex: number;
}

export interface TeacherSummaryResponse {
  totalStudents: number;
  averageScore: number;
  topicFailureRates: { topic: string; failurePercentage: number }[];
  studentsAtRisk: { id: string; name: string; weakestTopic: string; score: number }[];
  students: {
    id: string;
    name: string;
    group: string;
    averageScore: number;
    scoresByTopic: Record<string, number>;
    weakestTopic: string;
    completedAt: string | null;
  }[];
}

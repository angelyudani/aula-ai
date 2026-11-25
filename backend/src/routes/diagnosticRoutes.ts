import { Router, Request, Response } from 'express';
import { evaluateDiagnostic } from '../services/diagnosticEngine';
import { mathQuestions } from '../data/mathQuestions';
import { supabase } from '../db/supabaseClient';

const router = Router();

router.get('/diagnostic/questions', (_req: Request, res: Response) => {
  const safeQuestions = mathQuestions.map(({ id, topic, prompt, options }) => ({
    id, topic, prompt, options
  }));
  res.json(safeQuestions);
});

router.post('/diagnostic', async (req: Request, res: Response) => {
  try {
    const { studentId, answers } = req.body;
    if (typeof studentId !== 'string' || !studentId.trim() || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Se requieren studentId y answers válidos' });
    }
    const validAnswers = answers.every((answer) =>
      answer && typeof answer.questionId === 'string' && typeof answer.answer === 'string'
    );
    if (!validAnswers) {
      return res.status(400).json({ error: 'Cada respuesta debe incluir questionId y answer como texto' });
    }
    const submittedIds = answers.map((answer: { questionId: string }) => answer.questionId);
    const expectedIds = mathQuestions.map((question) => question.id);
    if (submittedIds.length !== expectedIds.length || new Set(submittedIds).size !== expectedIds.length || expectedIds.some((id) => !submittedIds.includes(id))) {
      return res.status(400).json({ error: `Envía una respuesta para cada una de las ${expectedIds.length} preguntas` });
    }

    const result = evaluateDiagnostic(studentId, answers);

    const rowsToInsert = Object.entries(result.scoresByTopic).map(([topic, score]) => {
      const mistake = result.detectedMistakes.find((item) =>
        mathQuestions.find((question) => question.id === item.questionId)?.topic === topic
      );
      return {
        student_id: studentId,
        topic,
        score,
        error_pattern: mistake ? mistake.errorPattern : null
      };
    });

    const { error } = await supabase.from('diagnostic_results').insert(rowsToInsert);
    if (error) {
      console.error('Error al guardar el diagnóstico en Supabase:', error.message);
      return res.status(500).json({ error: 'No se pudo guardar el diagnóstico' });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno al evaluar diagnóstico' });
  }
});

router.get('/student/:id/progress', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('diagnostic_results')
    .select('*')
    .eq('student_id', id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ studentId: id, history: data || [] });
});

export default router;

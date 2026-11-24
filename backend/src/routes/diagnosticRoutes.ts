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
    if (!studentId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Faltan studentId o answers' });
    }

    const result = evaluateDiagnostic(studentId, answers);

    const rowsToInsert = Object.entries(result.scoresByTopic).map(([topic, score]) => {
      const mistake = result.detectedMistakes.find((m) =>
        topic === 'fracciones_suma' ? m.questionId.startsWith('frac') : m.questionId.startsWith('mult')
      );
      return {
        student_id: studentId,
        topic,
        score,
        error_pattern: mistake ? mistake.errorPattern : null
      };
    });

    const { error } = await supabase.from('diagnostic_results').insert(rowsToInsert);
    if (error) console.error('Aviso Supabase:', error.message);

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
import { Router, Request, Response } from "express";
import { generateTutorHint } from "../services/aiTutorService";

const router = Router();

router.post("/hint", async (req: Request, res: Response) => {
  const { questionPrompt, studentAnswer, errorPattern, hintLevel } = req.body;

  if (!questionPrompt || !hintLevel) {
    return res.status(400).json({ error: "Faltan questionPrompt o hintLevel" });
  }

  const validLevel = ([1, 2, 3].includes(Number(hintLevel)) ? Number(hintLevel) : 1) as 1 | 2 | 3;

  const result = await generateTutorHint({
    questionPrompt: String(questionPrompt),
    studentAnswer: String(studentAnswer || "Sin respuesta"),
    errorPattern: String(errorPattern || "default"),
    hintLevel: validLevel,
  });

  return res.status(200).json(result);
});

export default router;
export type DiagnosticTopic = 'suma' | 'resta' | 'multiplicacion' | 'fracciones'

export interface MathQuestion {
  id: string
  topic: DiagnosticTopic
  prompt: string
  options: string[]
  correctAnswer: string
  commonMistakes: Record<string, string>
}

/** Same 12-question demonstration set used by the student frontend. */
export const mathQuestions: MathQuestion[] = [
  { id: 'sum-01', topic: 'suma', prompt: '¿Cuánto es 248 + 135?', options: ['373', '383', '393', '283'], correctAnswer: '383', commonMistakes: { '373': 'error_de_suma_o_reagrupacion', '393': 'error_de_suma_o_reagrupacion', '283': 'error_de_suma_o_reagrupacion' } },
  { id: 'sum-02', topic: 'suma', prompt: 'En una caja hay 36 lápices y agregan 27 más. ¿Cuántos hay ahora?', options: ['53', '63', '73', '59'], correctAnswer: '63', commonMistakes: { '53': 'error_de_suma_o_reagrupacion', '73': 'error_de_suma_o_reagrupacion', '59': 'error_de_suma_o_reagrupacion' } },
  { id: 'sum-03', topic: 'suma', prompt: '¿Cuánto es 1,250 + 750?', options: ['1,900', '2,000', '2,100', '1,500'], correctAnswer: '2,000', commonMistakes: { '1,900': 'error_de_suma_o_valor_posicional', '2,100': 'error_de_suma_o_valor_posicional', '1,500': 'error_de_suma_o_valor_posicional' } },
  { id: 'rest-01', topic: 'resta', prompt: '¿Cuánto es 503 − 178?', options: ['335', '325', '425', '315'], correctAnswer: '325', commonMistakes: { '335': 'error_de_resta_o_reagrupacion', '425': 'error_de_resta_o_reagrupacion', '315': 'error_de_resta_o_reagrupacion' } },
  { id: 'rest-02', topic: 'resta', prompt: 'Había 82 libros y prestaron 29. ¿Cuántos quedan?', options: ['53', '63', '51', '57'], correctAnswer: '53', commonMistakes: { '63': 'error_de_resta_o_reagrupacion', '51': 'error_de_resta_o_reagrupacion', '57': 'error_de_resta_o_reagrupacion' } },
  { id: 'rest-03', topic: 'resta', prompt: '¿Cuánto es 1,000 − 465?', options: ['545', '535', '635', '525'], correctAnswer: '535', commonMistakes: { '545': 'error_de_resta_o_reagrupacion', '635': 'error_de_resta_o_reagrupacion', '525': 'error_de_resta_o_reagrupacion' } },
  { id: 'mult-01', topic: 'multiplicacion', prompt: '¿Cuánto es 7 × 8?', options: ['54', '56', '64', '48'], correctAnswer: '56', commonMistakes: { '54': 'confusion_tabla_del_9', '64': 'confusion_cuadrado_8x8', '48': 'confusion_tabla_del_6' } },
  { id: 'mult-02', topic: 'multiplicacion', prompt: '¿Cuánto es 9 × 6?', options: ['54', '56', '63', '48'], correctAnswer: '54', commonMistakes: { '56': 'confusion_tabla_del_8', '63': 'confusion_tabla_del_7', '48': 'confusion_tabla_del_8' } },
  { id: 'mult-03', topic: 'multiplicacion', prompt: '¿Cuánto es 12 × 4?', options: ['46', '48', '42', '44'], correctAnswer: '48', commonMistakes: { '46': 'error_de_multiplicacion', '42': 'error_de_multiplicacion', '44': 'error_de_multiplicacion' } },
  { id: 'frac-01', topic: 'fracciones', prompt: '¿Cuánto es 1/2 + 1/3?', options: ['2/5', '5/6', '1/6', '3/5'], correctAnswer: '5/6', commonMistakes: { '2/5': 'suma_directa_numerador_denominador', '1/6': 'multiplica_numeradores_y_denominadores', '3/5': 'error_de_equivalencia' } },
  { id: 'frac-02', topic: 'fracciones', prompt: '¿Cuánto es 1/4 + 2/4?', options: ['3/8', '2/4', '3/4', '1/2'], correctAnswer: '3/4', commonMistakes: { '3/8': 'suma_denominadores_iguales', '2/4': 'omite_un_numerador', '1/2': 'error_de_simplificacion' } },
  { id: 'frac-03', topic: 'fracciones', prompt: '¿Cuánto es 2/3 + 1/6?', options: ['3/9', '5/6', '1/2', '3/6'], correctAnswer: '5/6', commonMistakes: { '3/9': 'suma_directa_numerador_denominador', '1/2': 'error_de_equivalencia', '3/6': 'convierte_denominador_sin_numerador' } },
]

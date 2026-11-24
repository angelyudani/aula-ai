export interface MathQuestion {
  id: string;
  topic: 'multiplicacion' | 'fracciones_suma';
  prompt: string;
  options: string[];
  correctAnswer: string;
  commonMistakes: Record<string, string>;
}

export const mathQuestions: MathQuestion[] = [
  {
    id: 'mult-01',
    topic: 'multiplicacion',
    prompt: '¿Cuánto es 7 × 8?',
    options: ['54', '56', '64', '48'],
    correctAnswer: '56',
    commonMistakes: {
      '54': 'confusion_tabla_del_9',
      '64': 'confusion_cuadrado_8x8'
    }
  },
  {
    id: 'mult-02',
    topic: 'multiplicacion',
    prompt: '¿Cuánto es 12 × 4?',
    options: ['36', '44', '48', '52'],
    correctAnswer: '48',
    commonMistakes: {
      '44': 'olvido_llevar_decena'
    }
  },
  {
    id: 'mult-03',
    topic: 'multiplicacion',
    prompt: 'Si una caja tiene 9 lápices, ¿cuántos lápices hay en 6 cajas?',
    options: ['45', '54', '56', '63'],
    correctAnswer: '54',
    commonMistakes: {
      '45': 'multiplico_por_5_en_lugar_de_6',
      '63': 'multiplico_por_7_en_lugar_de_6'
    }
  },
  {
    id: 'frac-01',
    topic: 'fracciones_suma',
    prompt: '¿Cuánto es 1/2 + 1/3?',
    options: ['2/5', '5/6', '2/6', '1/5'],
    correctAnswer: '5/6',
    commonMistakes: {
      '2/5': 'suma_directa_numerador_denominador',
      '2/6': 'solo_multiplico_denominadores_sin_cruzar'
    }
  },
  {
    id: 'frac-02',
    topic: 'fracciones_suma',
    prompt: '¿Cuánto es 3/4 + 1/4?',
    options: ['4/8', '4/4', '3/8', '2/4'],
    correctAnswer: '4/4',
    commonMistakes: {
      '4/8': 'sumo_denominadores_iguales'
    }
  },
  {
    id: 'frac-03',
    topic: 'fracciones_suma',
    prompt: '¿Cuánto es 2/3 + 1/6?',
    options: ['3/9', '5/6', '3/6', '2/9'],
    correctAnswer: '5/6',
    commonMistakes: {
      '3/9': 'suma_directa_numerador_denominador',
      '3/6': 'igualo_denominador_pero_no_convirtio_numerador'
    }
  }
];
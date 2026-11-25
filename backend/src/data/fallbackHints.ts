// 1. Contrato interno: obliga a que todo error tenga exactamente 3 niveles de ayuda
export interface HintLevels {
  1: string; // Nivel 1: Pregunta guía
  2: string; // Nivel 2: Explicación del concepto
  3: string; // Nivel 3: Ejemplo parecido ya resuelto
}

// 2. Diccionario indexado por el 'errorPattern' este envía el diagnóstico
export const fallbackHintsByPattern: Record<string, HintLevels> = {
  // Caso estrella de la demo (1/2 + 1/3 = 2/5)
  suma_directa_numerador_denominador: {
    1: "Veo que sumaste los números de arriba entre sí y los de abajo entre sí. Antes de sumar, piensa: ¿podemos juntar medios y tercios directamente o necesitan tener el mismo tamaño de parte abajo?",
    2: "Para sumar fracciones con distinto denominador, primero debes encontrar un denominador común (un múltiplo de ambos números de abajo) y convertir cada fracción a su equivalente.",
    3: "Ejemplo parecido: para sumar 1/2 + 1/4, convertimos 1/2 en 2/4 para que ambos tengan el mismo denominador. Luego sumamos solo arriba: 2/4 + 1/4 = 3/4. Ahora aplica esa misma lógica a tu ejercicio."
  },

  // Por si el diagnóstico incluye resta de fracciones
  resta_directa_numerador_denominador: {
    1: "Noté que restaste directo arriba y abajo. Recuerda: ¿puedes quitarle tercios a medios sin antes convertirlos a partes del mismo tamaño?",
    2: "Al igual que en la suma, para restar fracciones con diferente denominador primero debes igualar los números de abajo buscando un múltiplo común.",
    3: "Ejemplo parecido: para resolver 3/4 - 1/2, convertimos 1/2 en 2/4. Ya con el mismo denominador, restamos solo arriba: 3/4 - 2/4 = 1/4. Inténtalo con tus fracciones."
  },

  // Por si el alumno confunde multiplicación con suma de fracciones
  error_multiplicacion_fracciones: {
    1: "Revisa bien el signo de la operación: en la multiplicación de fracciones, ¿realmente necesitas buscar un denominador común o puedes operar directo?",
    2: "Multiplicar fracciones es más directo que sumarlas: multiplicas numerador por numerador (los de arriba) y denominador por denominador (los de abajo).",
    3: "Ejemplo parecido: si tienes 2/3 × 1/5, multiplicas arriba 2 × 1 = 2 y abajo 3 × 5 = 15, obteniendo 2/15. Haz lo mismo con los números de tu problema."
  },

  // Paracaídas universal: se activa si llega cualquier otro error no registrado
  default: {
    1: "Revisa tu procedimiento paso a paso: ¿qué operación te pide exactamente el problema y qué datos tienes para empezar?",
    2: "Divide el problema en dos pasos pequeños: primero asegura que tus términos estén en el mismo formato o denominador, y después aplica la operación principal.",
    3: "Ejemplo guía: si tienes 2/3 + 1/6, busca un número donde coincidan el 3 y el 6 (el 6). Convierte 2/3 multiplicando arriba y abajo por 2 para obtener 4/6, y suma 4/6 + 1/6 = 5/6."
  }
};

// 3. Función pública consumirá el servicio de IA cuando algo falle
export function getFallbackHint(errorPattern: string, hintLevel: 1 | 2 | 3): string {
  const patternHints = fallbackHintsByPattern[errorPattern] || fallbackHintsByPattern.default;
  return patternHints[hintLevel] || fallbackHintsByPattern.default[1];
}
// 1. Contrato interno: obliga a que todo error tenga exactamente 3 niveles de ayuda
export interface HintLevels {
  1: string; // Nivel 1: Pregunta guía
  2: string; // Nivel 2: Explicación del concepto
  3: string; // Nivel 3: Ejemplo parecido ya resuelto
}

// 2. Diccionario indexado por el 'errorPattern' que envían el diagnóstico y la práctica
export const fallbackHintsByPattern: Record<string, HintLevels> = {
  // Fracciones: suma directa de numeradores y denominadores (ej. 1/2 + 1/4 = 2/6)
  suma_lineal_denominadores: {
    1: "Veo que sumaste los números de arriba entre sí y los de abajo entre sí. Antes de sumar, piensa: ¿podemos juntar partes de distinto tamaño directamente o necesitan tener el mismo denominador?",
    2: "Para sumar fracciones con distinto denominador, primero debes encontrar un denominador común (un múltiplo de ambos números de abajo) y convertir cada fracción a su equivalente.",
    3: "Ejemplo parecido: para sumar 1/2 + 1/3, buscamos un denominador común como 6. Convertimos 1/2 en 3/6 y 1/3 en 2/6; luego sumamos solo arriba: 3/6 + 2/6 = 5/6. Ahora aplica esa misma lógica a tu ejercicio."
  },

  suma_directa_numerador_denominador: {
    1: "Veo que sumaste los números de arriba entre sí y los de abajo entre sí. Antes de sumar, piensa: ¿podemos juntar medios y tercios directamente o necesitan tener el mismo tamaño de parte abajo?",
    2: "Para sumar fracciones con distinto denominador, primero debes encontrar un denominador común (un múltiplo de ambos números de abajo) y convertir cada fracción a su equivalente.",
    3: "Ejemplo parecido: para sumar 1/2 + 1/4, convertimos 1/2 en 2/4 para que ambos tengan el mismo denominador. Luego sumamos solo arriba: 2/4 + 1/4 = 3/4. Ahora aplica esa misma lógica a tu ejercicio."
  },

  // Fracciones: comparación o equivalencia sin denominador común
  denominador_comun_fracciones: {
    1: "Antes de operar o comparar estas fracciones, fíjate en los números de abajo: ¿representan partes del mismo tamaño o necesitas igualar sus denominadores primero?",
    2: "Cuando dos fracciones tienen distinto denominador, multiplica el numerador y el denominador por el mismo número hasta que ambas compartan un denominador común.",
    3: "Ejemplo parecido: para comparar 2/3 y 3/4, usamos 12 como denominador común. Convertimos 2/3 en 8/12 y 3/4 en 9/12; así es fácil ver que 9/12 es mayor."
  },

  // Resta de fracciones
  resta_directa_numerador_denominador: {
    1: "Noté que restaste directo arriba y abajo. Recuerda: ¿puedes quitarle tercios a medios sin antes convertirlos a partes del mismo tamaño?",
    2: "Al igual que en la suma, para restar fracciones con diferente denominador primero debes igualar los números de abajo buscando un múltiplo común.",
    3: "Ejemplo parecido: para resolver 3/4 - 1/2, convertimos 1/2 en 2/4. Ya con el mismo denominador, restamos solo arriba: 3/4 - 2/4 = 1/4. Inténtalo con tus fracciones."
  },

  // Multiplicación de fracciones
  error_multiplicacion_fracciones: {
    1: "Revisa bien el signo de la operación: en la multiplicación de fracciones, ¿realmente necesitas buscar un denominador común o puedes operar directo?",
    2: "Multiplicar fracciones es más directo que sumarlas: multiplicas numerador por numerador (los de arriba) y denominador por denominador (los de abajo).",
    3: "Ejemplo parecido: si tienes 2/3 × 1/5, multiplicas arriba 2 × 1 = 2 y abajo 3 × 5 = 15, obteniendo 2/15. Haz lo mismo con los números de tu problema."
  },

  // Suma: reagrupación y valor posicional
  reagrupacion_valor_posicional: {
    1: "Alinea bien unidades, decenas y centenas. Cuando sumas una columna y el resultado llega a 10 o más, ¿cómo pasas esa decena a la siguiente columna?",
    2: "En la suma por valor posicional, empezamos por las unidades (de derecha a izquierda) y reagrupamos ('llevamos') cada grupo de 10 hacia la columna de la izquierda.",
    3: "Ejemplo parecido: en 148 + 135, sumamos primero las unidades: 8 + 5 = 13 (escribimos 3 y llevamos 1 decena). Luego decenas: 1 + 4 + 3 = 8, y centenas: 1 + 1 = 2. Resultado: 283."
  },

  // Resta: desagrupación y conversión de unidades
  desagrupacion_o_conversion_unidades: {
    1: "Revisa columna por columna de derecha a izquierda: si la cifra de arriba es menor que la de abajo (o hay distintas unidades como metros y centímetros), ¿qué necesitas transformar primero?",
    2: "En la resta, cuando un dígito de arriba es menor que el de abajo, desagrupamos ('pedimos prestada') 1 unidad de la columna izquierda, que equivale a 10 en la columna actual.",
    3: "Ejemplo parecido: para calcular 412 − 158, en las unidades 2 es menor que 8, así que tomamos 1 decena y el 2 se convierte en 12 (12 − 8 = 4). Seguimos igual en las decenas hasta obtener 254."
  },

  // Multiplicación: descomposición de factores
  descomposicion_factores_tablas: {
    1: "En lugar de intentar recordar el resultado de golpe, ¿cómo puedes dividir uno de los factores en grupos más fáciles que ya domines, como tablas del 5 o del 10?",
    2: "La propiedad distributiva permite separar una multiplicación grande en dos multiplicaciones más sencillas y después sumar ambos productos parciales.",
    3: "Ejemplo parecido: para calcular 7 × 8, puedes pensarlo como (5 × 8) + (2 × 8). Calculas 40 + 16 y al sumar ambos obtienes 56. Aplica esa misma estrategia a tu ejercicio."
  },

  // Paracaídas universal para cualquier otro patrón
  default: {
    1: "Lee con calma lo que pide el ejercicio e identifica los datos clave: ¿cuál es el primer paso pequeño que puedes dar sin intentar resolver todo de una vez?",
    2: "Divide el problema en dos partes: primero organiza o transforma los números para que sean fáciles de operar, y después realiza el cálculo verificando cada paso.",
    3: "Ejemplo guía: si tienes 18 + 25, separa decenas y unidades: (10 + 20) + (8 + 5) = 30 + 13 = 43. Usa esa misma calma para revisar tu procedimiento."
  }
};

// 3. Función pública que consume el servicio de IA como respaldo
export function getFallbackHint(errorPattern: string, hintLevel: 1 | 2 | 3): string {
  const patternHints = fallbackHintsByPattern[errorPattern] || fallbackHintsByPattern.default;
  return patternHints[hintLevel] || fallbackHintsByPattern.default[1];
}
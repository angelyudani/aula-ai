import type { StudentTopic } from '../types/student'

export type TeacherStudent = {
  id: string
  name: string
  group: string
  average: number
  topics: Record<StudentTopic, number>
  completedAt: string
}

const firstNames = [
  'Valentina', 'Mateo', 'Camila', 'Santiago', 'Renata', 'Diego', 'Ximena', 'Leonardo',
  'Regina', 'Emiliano', 'Valeria', 'Sebastián', 'Mariana', 'Daniel', 'Natalia', 'Gael',
  'Lucía', 'Andrés', 'Fernanda', 'Pablo', 'Victoria', 'Nicolás', 'Isabella', 'Diego',
  'Elena', 'Joaquín', 'Romina', 'Samuel', 'Mía', 'Iker', 'Alexa', 'Bruno',
  'Abril', 'Ian', 'Aitana', 'Hugo', 'Julia', 'Marco', 'Emma', 'Tomás',
  'Paula', 'Adrián', 'Luna', 'David',
]

const lastNames = [
  'Hernández', 'García', 'Martínez', 'López', 'Pérez', 'González', 'Rodríguez', 'Sánchez',
  'Ramírez', 'Cruz', 'Flores', 'Morales', 'Reyes', 'Torres', 'Gutiérrez', 'Ortiz',
  'Díaz', 'Mendoza', 'Vargas', 'Castillo', 'Romero', 'Álvarez', 'Ruiz', 'Jiménez',
  'Navarro', 'Ramos', 'Delgado', 'Ríos', 'Medina', 'Aguilar', 'Vega', 'Campos',
  'Cortés', 'Silva', 'Herrera', 'Luna', 'Peña', 'Fuentes', 'Carrillo', 'Márquez',
  'Núñez', 'Salazar', 'Cabrera', 'Acosta',
]

/** 44 deterministic demo learners; 30 show low fraction mastery (68% of the group). */
export const teacherMockStudents: TeacherStudent[] = firstNames.map((name, index) => {
  const suma = 46 + ((index * 17 + 21) % 53)
  const resta = 42 + ((index * 13 + 34) % 57)
  const multiplicacion = 40 + ((index * 19 + 16) % 60)
  const fracciones = index < 30
    ? 18 + ((index * 7 + 15) % 40)
    : 62 + ((index * 11 + 8) % 38)
  const topics = { suma, resta, multiplicacion, fracciones }
  const average = Math.round((suma + resta + multiplicacion + fracciones) / 4)
  const day = String(24 - (index % 6)).padStart(2, '0')

  return {
    id: `alum-demo-${String(index + 1).padStart(2, '0')}`,
    name: `${name} ${lastNames[index]}`,
    group: '2° A',
    average,
    topics,
    completedAt: `2026-11-${day}T${String(8 + (index % 5)).padStart(2, '0')}:${String((index * 11) % 60).padStart(2, '0')}:00`,
  }
})

export const teacherDemoStudent = {
  id: 'alum-demo-45',
  name: 'Sofía',
  group: '2° A',
  status: 'pending' as const,
}

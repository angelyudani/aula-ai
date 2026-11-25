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

export function getDemoStudentName(id: string): string {
  if (id === 'alum-demo-45') return 'Sofía'
  const match = id.match(/^alum-demo-(\d{2})$/)
  const index = match ? Number(match[1]) - 1 : -1
  return index >= 0 && index < firstNames.length
    ? `${firstNames[index]} ${lastNames[index]}`
    : `Alumno ${id}`
}

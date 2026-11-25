import dotenv from 'dotenv'
import { supabase } from '../db/supabaseClient'

dotenv.config()

const topicScores = (index: number) => ({
  suma: 46 + ((index * 17 + 21) % 53),
  resta: 42 + ((index * 13 + 34) % 57),
  multiplicacion: 40 + ((index * 19 + 16) % 60),
  fracciones: index < 30
    ? 18 + ((index * 7 + 15) % 40)
    : 62 + ((index * 11 + 8) % 38),
})

async function seedDemoStudents() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_KEY en backend/.env')
  }

  const studentIds = Array.from({ length: 44 }, (_, index) => `alum-demo-${String(index + 1).padStart(2, '0')}`)

  // 1. Registrar primero los 44 alumnos en la tabla padre 'students'
  const demoStudents = studentIds.map((id, index) => ({
    id,
    name: `Estudiante Demo ${String(index + 1).padStart(2, '0')}`,
  }))

  const { error: studentsError } = await supabase
    .from('students')
    .upsert(demoStudents, { onConflict: 'id' })

  if (studentsError) {
    throw new Error(`No se pudieron registrar los alumnos en students: ${studentsError.message}`)
  }

  // 2. Revisar resultados existentes e insertar los faltantes
  const { data: existingRows, error: readError } = await supabase
    .from('diagnostic_results')
    .select('student_id, topic')
    .in('student_id', studentIds)

  if (readError) throw new Error(`No se pudo revisar la tabla diagnostic_results: ${readError.message}`)

  const existingKeys = new Set((existingRows ?? []).map((row) => `${row.student_id}:${row.topic}`))
  const rows = studentIds.flatMap((studentId, index) =>
    Object.entries(topicScores(index))
      .filter(([topic]) => !existingKeys.has(`${studentId}:${topic}`))
      .map(([topic, score]) => ({
        student_id: studentId,
        topic,
        score,
        error_pattern: null,
      }))
  )

  if (rows.length === 0) {
    console.log('Los 44 perfiles demo ya tienen resultados por tema; no se insertaron filas.')
    return
  }

  const { error: insertError } = await supabase.from('diagnostic_results').insert(rows)
  if (insertError) throw new Error(`No se pudieron cargar los datos demo: ${insertError.message}`)
  console.log(`Se agregaron ${rows.length} resultados demo para los 44 alumnos. Sofía (#45) permanece libre.`)
}

seedDemoStudents().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falló la carga de datos demo.')
  process.exitCode = 1
})
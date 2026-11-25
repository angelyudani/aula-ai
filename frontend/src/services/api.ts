import type { DiagnosticRequest, DiagnosticResponse, TeacherSummaryResponse } from '../types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error || `Error del servidor (${response.status})`)
  }
  return response.json() as Promise<T>
}

export async function submitDiagnostic(request: DiagnosticRequest): Promise<DiagnosticResponse> {
  const response = await fetch(`${API_URL}/diagnostic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return readResponse<DiagnosticResponse>(response)
}

export async function getTeacherSummary(): Promise<TeacherSummaryResponse> {
  const response = await fetch(`${API_URL}/teacher/summary`)
  return readResponse<TeacherSummaryResponse>(response)
}

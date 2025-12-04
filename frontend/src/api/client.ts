import { ComparisonResponse } from '../types'

export async function fetchComparison(): Promise<ComparisonResponse> {
  const response = await fetch('/api/comparison')
  if (!response.ok) {
    return {
      success: false,
      error: `Error al consultar el backend: ${response.statusText}`
    }
  }
  return response.json()
}

export type FieldErrors = Record<string, string>

export function extractFieldErrors(err: any): FieldErrors | null {
  // Axios-style error
  const status = err?.response?.status
  const data = err?.response?.data

  if (status === 400 && data && typeof data === 'object' && !Array.isArray(data)) {
    return data as FieldErrors
  }

  // Fetch-style (if you ever switch): if you throw `{ status, data }`
  if (err?.status === 400 && err?.data && typeof err.data === 'object' && !Array.isArray(err.data)) {
    return err.data as FieldErrors
  }

  return null
}

import { describe, it, expect } from 'vitest'
import { extractFieldErrors } from '@/utils/fieldErrors'

describe('extractFieldErrors', () => {
  /** Test 2: Wenn der Server 400 + Feldfehler schickt, werden diese Feldfehler korrekt zurückgegeben. */
  it('returns_field_errors_for_axios_400_test2', () => {
    const err = {
      response: {
        status: 400,
        data: { title: 'Titel ist Pflicht', minutes: 'min >= 1' },
      },
    }
    expect(extractFieldErrors(err)).toEqual({ title: 'Titel ist Pflicht', minutes: 'min >= 1' })
  })

  /** Test 3: Gibt null zurück, wenn kein 400er-FieldError-Objekt vorliegt (Edge Case). */
  it('returns_null_for_non_400_test3', () => {
    const err = { response: { status: 500, data: { message: 'Boom' } } }
    expect(extractFieldErrors(err)).toBeNull()
  })
})

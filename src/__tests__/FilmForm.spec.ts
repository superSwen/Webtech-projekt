import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FilmForm from '@/components/FilmForm.vue'

vi.mock('@/api/omdbApi', () => ({
  omdbSearch: vi.fn(async () => []),
}))

describe('FilmForm', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  /** Test 7: Ohne gültige Eingaben darf man nicht speichern (Button ist deaktiviert). */
  it('submit_disabled_when_invalid_test7', async () => {
    const wrapper = mount(FilmForm, {
      props: { editing: null, busy: false, error: null, fieldErrors: {}, resetKey: 0 },
    })

    const submitBtn = wrapper.find('button.btn.primary')
    expect(submitBtn.exists()).toBe(true)
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  /** Test 8: Bei gültigen Eingaben wird ein "submit" Event mit getrimmten Daten gesendet (Happy Path). */
  it('emits_submit_with_trimmed_payload_test8', async () => {
    const wrapper = mount(FilmForm, {
      props: { editing: null, busy: false, error: null, fieldErrors: {}, resetKey: 0 },
    })

    // Title (Placeholder kann variieren -> wir suchen "Harry" ODER allgemein erstes Text-Input)
    const titleInput =
      wrapper.find('input[placeholder*="Harry"]').exists()
        ? wrapper.find('input[placeholder*="Harry"]')
        : wrapper.find('input[type="text"]')

    expect(titleInput.exists()).toBe(true)
    await titleInput.setValue('  Dune  ')

    // Debounce im Code -> sicherheitshalber etwas mehr
    vi.advanceTimersByTime(600)
    await nextTick()

    // Minutes (oft number oder text) -> placeholder fallback, sonst erstes number-input
    const minutesInput =
      wrapper.find('input[placeholder*="90"]').exists()
        ? wrapper.find('input[placeholder*="90"]')
        : wrapper.find('input[type="number"]').exists()
          ? wrapper.find('input[type="number"]')
          : wrapper.findAll('input').at(1)

    expect(minutesInput).toBeTruthy()
    await minutesInput!.setValue('155')
    await nextTick()

    // Notes: kann input oder textarea sein -> robust suchen
    const notesEl =
      wrapper.find('textarea').exists()
        ? wrapper.find('textarea')
        : wrapper.find('input[placeholder^="z.B. ggf."]').exists()
          ? wrapper.find('input[placeholder^="z.B. ggf."]')
          : wrapper.findAll('input').at(2)

    expect(notesEl).toBeTruthy()
    await notesEl!.setValue('  Nice  ')
    await nextTick()

    const submitBtn = wrapper.find('button.btn.primary')
    expect(submitBtn.exists()).toBe(true)
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)

    await submitBtn.trigger('click')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]?.[0]).toEqual({
      title: 'Dune',
      minutes: 155,
      notes: 'Nice',
      imdbId: null,
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FilmForm from '@/components/FilmForm.vue'

vi.mock('@/api/omdbApi', () => ({
  omdbSearch: vi.fn(async () => []),
}))

describe('FilmForm', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  /** Test 7: Submit bleibt disabled, solange Pflichtfelder ungültig sind (Edge Case). */
  it('submit_disabled_when_invalid_test7', async () => {
    const wrapper = mount(FilmForm, {
      props: { editing: null, busy: false, error: null, fieldErrors: {} },
    })

    const submitBtn = wrapper.find('button.btn.primary')
    expect(submitBtn.exists()).toBe(true)
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  /** Test 8: Bei gültigen Inputs wird submit mit getrimmtem Payload emitted (Happy Path). */
  it('emits_submit_with_trimmed_payload_test8', async () => {
    const wrapper = mount(FilmForm, {
      props: { editing: null, busy: false, error: null, fieldErrors: {} },
    })

    const titleInput = wrapper.find('input[placeholder*="Harry"]')
    await titleInput.setValue('  Dune  ')
    vi.advanceTimersByTime(300)
    await nextTick()

    const minutesInput = wrapper.find('input[placeholder="z.B. 90"]')
    await minutesInput.setValue('155')
    await nextTick()

    const notesInput = wrapper.findAll('input.input').at(2)
    await notesInput!.setValue('  Nice  ')
    await nextTick()

    await wrapper.find('button.btn.primary').trigger('click')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({
      title: 'Dune',
      minutes: 155,
      notes: 'Nice',
      imdbId: null,
    })
  })
})

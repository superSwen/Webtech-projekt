import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilmList from '@/components/FilmList.vue'

describe('FilmList', () => {
  /** Test 10: Klick auf Titel-Link emitted "open" mit korrektem Item (Happy Path). */
  it('click_title_emits_open_test10', async () => {
    const item = { id: 3, title: 'Inception', minutes: 148, notes: null, imdbId: null }
    const wrapper = mount(FilmList, {
      props: { items: [item], busy: false },
    })

    const titleLink = wrapper.find('a.titleLink')
    expect(titleLink.exists()).toBe(true)

    await titleLink.trigger('click')
    const emitted = wrapper.emitted('open')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(item)
  })
})

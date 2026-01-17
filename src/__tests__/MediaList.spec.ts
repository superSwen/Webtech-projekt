import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import MediaList from '@/components/MediaList.vue'

describe('MediaList', () => {
  /** Test 5: Bei leerer Liste wird der Empty-State Text angezeigt (Edge Case). */
  it('shows_empty_state_when_no_items_test5', () => {
    const wrapper = mount(MediaList, {
      props: { title: 'Filme', kind: 'movie', items: [] },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    expect(wrapper.text()).toContain('Noch keine Einträge gespeichert.')
    expect(wrapper.text()).toContain('0 Einträge')
  })

  /** Test 6: Rendert RouterLink mit korrektem to (/details/{kind}/{id}) (Happy Path). */
  it('renders_routerlink_to_details_test6', () => {
    const wrapper = mount(MediaList, {
      props: {
        title: 'Filme',
        kind: 'movie',
        items: [{ id: 12, title: 'Dune', minutes: 155 }],
      },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.exists()).toBe(true)
    expect(link.props('to')).toBe('/details/movie/12')
    expect(wrapper.text()).toContain('— 155 min')
  })
})

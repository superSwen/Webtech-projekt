import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import App from '../App.vue'


vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'home', query: {} }),
}))


const RouterViewStub = defineComponent({
  name: 'RouterView',
  setup(_, { slots }) {
    const Comp = defineComponent({ name: 'CompStub', template: '<div data-test="router-view"></div>' })
    return () => (slots.default ? slots.default({ Component: Comp }) : h('div'))
  },
})

describe('App', () => {
  /** Test 1: Prüft, dass die App ohne Fehler startet und der Router-Bereich angezeigt wird. */
  it('mounts_and_renders_routerview_test1', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterLink: true,
          RouterView: RouterViewStub,

          // optional but keeps the test clean and avoids unrelated rendering noise
          HeroCharacter: true,
          FoldNavLink: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-test="router-view"]').exists()).toBe(true)
  })
})

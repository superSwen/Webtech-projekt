import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  /** Test 1: App mountet erfolgreich und rendert RouterView-Stub (Smoke Test). */
  it('mounts_and_renders_routerview_test1', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterLink: true,
          RouterView: { template: '<div data-test="router-view"></div>' },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-test="router-view"]').exists()).toBe(true)
  })
})

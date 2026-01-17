import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders header brand', () => {
    const wrapper = mount(App, { global: { stubs: ['RouterLink', 'RouterView'] } })
    expect(wrapper.text()).toContain('MOVIE/SERIES')
    expect(wrapper.text()).toContain('TRACKER')
  })
})


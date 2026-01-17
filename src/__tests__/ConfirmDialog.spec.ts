import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  /** Test 9: Dialog: Escape schließt ihn und Klick auf "Löschen" bestätigt ihn. */
  it('escape_emits_close_and_confirm_click_emits_confirm_test9', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Film löschen?',
        message: 'Willst du wirklich löschen?',
        confirmText: 'Löschen',
        cancelText: 'Abbrechen',
        danger: true,
      },
      global: {
        // Teleport/Transition stubben -> stabilere Tests
        stubs: { teleport: true, transition: false },
      },
    })

    await nextTick()

    // Escape -> close
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()

    // Confirm button ist der 2. Button (nach Cancel)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)

    const confirmBtn = buttons.at(1)
    expect(confirmBtn).toBeTruthy()
    await confirmBtn!.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()

  })
})

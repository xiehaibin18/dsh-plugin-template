import { PLUGIN_ID } from '../shared/settings.js'
import { MESSAGES, type Translate } from './messages.js'
import { SettingsPanel } from './SettingsPanel.js'
import styles from './styles.css' with { type: 'text' }

interface ClientContext {
  locale: {
    register(namespace: string, messages: typeof MESSAGES): () => void
    bind(namespace: string): Translate
  }
  slots: {
    inject(name: 'settings.section', register: () => unknown): void
    register(
      entry: {
        name: 'settings.section'
        id: string
        order: number
        label: () => string
        locale: string
        inject: () => { t: Translate }
      },
      component: () => React.JSX.Element,
    ): unknown
  }
  effect(register: () => () => void, label: string): void
}

export const name = PLUGIN_ID
export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(PLUGIN_ID, MESSAGES), `${PLUGIN_ID}: locale`)
  const t = ctx.locale.bind(PLUGIN_ID)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: PLUGIN_ID,
    order: 50,
    label: () => t('title'),
    locale: PLUGIN_ID,
    inject: () => ({ t }),
  }, () => (
    <>
      <style>{styles}</style>
      <SettingsPanel t={t} />
    </>
  )))
}

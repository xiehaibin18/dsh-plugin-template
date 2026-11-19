import { PLUGIN_ID, SETTINGS_PATH } from '../shared/settings.js'
import { createSettingsHandler } from './settings-handler.js'

interface ConnectionScope {
  connection: {
    fetch: {
      register(route: {
        path: string
        methods: readonly ('GET' | 'POST')[]
        requestBody: 'buffered'
        fetch: (request: Request) => Promise<Response>
      }): () => Promise<void>
    }
  }
  effect(register: () => () => Promise<void>, label: string): void
}

interface HostContext {
  inject(services: string[], register: (scope: ConnectionScope) => void): void
}

export const name = PLUGIN_ID

export function apply(ctx: HostContext): void {
  const handleSettings = createSettingsHandler()
  ctx.inject(['connection'], (scope) => {
    scope.effect(
      () => scope.connection.fetch.register({
        path: SETTINGS_PATH,
        methods: ['GET', 'POST'],
        requestBody: 'buffered',
        fetch: handleSettings,
      }),
      `${PLUGIN_ID}: settings route`,
    )
  })
}

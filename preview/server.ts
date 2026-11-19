import { startPreview } from '@xiehaibin18/dsh-plugin-dev/preview'
import '../scripts/check-toolchain.js'
import { createSettingsHandler } from '../src/server/settings-handler.js'
import { SETTINGS_PATH } from '../src/shared/settings.js'
import page from './index.html'

const fixture = createSettingsHandler({ displayName: 'Sandbox Workspace', showStatus: true })
const server = startPreview({
  page,
  defaultPort: 4317,
  fetch: async (request) => new URL(request.url).pathname === SETTINGS_PATH
    ? fixture(request)
    : new Response(null, { status: 404 }),
})
console.info(`Plugin preview: ${server.url}`)

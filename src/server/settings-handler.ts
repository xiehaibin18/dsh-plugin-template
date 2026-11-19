import { DEFAULT_SETTINGS, parseSettings, type Settings } from '../shared/settings.js'

export function createSettingsHandler(initial: Settings = DEFAULT_SETTINGS) {
  let settings = { ...initial }

  return async function handleSettings(request: Request): Promise<Response> {
    const headers = { 'cache-control': 'no-store' }
    if (request.method === 'GET') return Response.json(settings, { headers })
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { ...headers, allow: 'GET, POST' } })
    }

    const body: unknown = await request.json().catch(() => null)
    const next = parseSettings(body)
    if (!next) return Response.json({ error: 'Invalid settings' }, { status: 400, headers })

    settings = next
    return Response.json(settings, { headers })
  }
}

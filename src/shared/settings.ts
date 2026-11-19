import { name } from '../../package.json' with { type: 'json' }

export const PLUGIN_ID = name
export const SETTINGS_PATH = `/api/${PLUGIN_ID}`
export const MAX_NAME_LENGTH = 64

export interface Settings {
  displayName: string
  showStatus: boolean
}

export const DEFAULT_SETTINGS: Settings = { displayName: 'Workspace', showStatus: true }

export function parseSettings(value: unknown): Settings | null {
  if (typeof value !== 'object' || value === null || !('displayName' in value) || !('showStatus' in value)) {
    return null
  }
  const { displayName, showStatus } = value
  if (typeof displayName !== 'string' || typeof showStatus !== 'boolean') return null

  const name = displayName.trim()
  return name.length > 0 && name.length <= MAX_NAME_LENGTH ? { displayName: name, showStatus } : null
}

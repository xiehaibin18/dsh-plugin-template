import { expect, test } from 'bun:test'
import { createSettingsHandler } from '../src/server/settings-handler.js'
import { SETTINGS_PATH } from '../src/shared/settings.js'

const url = new URL(SETTINGS_PATH, 'http://localhost')
const read = () => new Request(url)
const write = (body: string) => new Request(url, { method: 'POST', body })

test('settings are scoped to one handler and saves return normalized values', async () => {
  const host = createSettingsHandler()
  const secondHost = createSettingsHandler()
  const saved = await host(write(JSON.stringify({ displayName: '  Test Workspace  ', showStatus: false })))
  expect(saved.status).toBe(200)
  expect(await saved.json()).toEqual({ displayName: 'Test Workspace', showStatus: false })
  expect(await (await host(read())).json()).toEqual({ displayName: 'Test Workspace', showStatus: false })
  expect(await (await secondHost(read())).json()).toEqual({ displayName: 'Workspace', showStatus: true })
})

test('invalid settings leave the current value intact', async () => {
  const host = createSettingsHandler()
  for (const body of ['{', '{"displayName":" ","showStatus":true}', '{"displayName":"Test","showStatus":"on"}']) {
    expect((await host(write(body))).status).toBe(400)
  }
  expect(await (await host(read())).json()).toEqual({ displayName: 'Workspace', showStatus: true })
})

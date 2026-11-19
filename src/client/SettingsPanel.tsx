import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { MAX_NAME_LENGTH, parseSettings, SETTINGS_PATH, type Settings } from '../shared/settings.js'
import { Button, Input, Switch } from './controls.js'
import type { Translate } from './messages.js'

type Status = 'loading' | 'loadError' | 'ready' | 'saving' | 'saved' | 'saveError'

async function requestSettings(signal: AbortSignal, settings?: Settings) {
  const response = await fetch(SETTINGS_PATH, settings === undefined ? { signal } : {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(settings),
    signal,
  })
  if (!response.ok) throw new Error(`Settings request failed: HTTP ${response.status}`)

  const result = parseSettings(await response.json())
  if (!result) throw new Error('Invalid settings response')
  return result
}

export function SettingsPanel({ t }: { t: Translate }) {
  const id = useId()
  const [draft, setDraft] = useState<Settings | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)
  const saveRequest = useRef<AbortController | null>(null)
  const hasDraft = draft !== null

  useEffect(() => {
    // React Refresh re-runs effects. Leave an already loaded draft in place.
    if (hasDraft) return
    const loadRequest = new AbortController()
    void requestSettings(loadRequest.signal).then(
      (settings) => {
        if (loadRequest.signal.aborted) return
        setDraft(settings)
        setStatus('ready')
      },
      () => {
        if (!loadRequest.signal.aborted) setStatus('loadError')
      },
    )
    return () => loadRequest.abort()
  }, [attempt, hasDraft])

  useEffect(() => () => {
    saveRequest.current?.abort()
    saveRequest.current = null
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft || saveRequest.current || !parseSettings(draft)) return

    const request = new AbortController()
    saveRequest.current = request
    setStatus('saving')
    try {
      const settings = await requestSettings(request.signal, draft)
      if (request.signal.aborted) return
      setDraft(settings)
      setStatus('saved')
    } catch {
      if (!request.signal.aborted) setStatus('saveError')
    } finally {
      if (saveRequest.current === request) saveRequest.current = null
    }
  }

  function edit(next: Settings) {
    setDraft(next)
    setStatus('ready')
  }

  return (
    <section className="dsh-example-settings" aria-labelledby={`${id}-title`}>
      <header>
        <h2 id={`${id}-title`}>{t('title')}</h2>
        <p>{t('summary')}</p>
      </header>
      {status === 'loading' && <p role="status">{t('loading')}</p>}
      {status === 'loadError' && (
        <div className="dsh-example-actions">
          <p role="alert">{t('loadError')}</p>
          <Button onClick={() => { setStatus('loading'); setAttempt((count) => count + 1) }}>{t('retry')}</Button>
        </div>
      )}
      {draft && (
        <form onSubmit={save}>
          <div className="dsh-example-row">
            <label htmlFor={`${id}-name`}>{t('name')}</label>
            <Input
              id={`${id}-name`}
              value={draft.displayName}
              maxLength={MAX_NAME_LENGTH}
              required
              disabled={status === 'saving'}
              onChange={(event) => edit({ ...draft, displayName: event.currentTarget.value })}
            />
          </div>
          <div className="dsh-example-row">
            <label htmlFor={`${id}-status`}>{t('status')}</label>
            <Switch
              id={`${id}-status`}
              checked={draft.showStatus}
              onCheckedChange={(showStatus) => edit({ ...draft, showStatus })}
              disabled={status === 'saving'}
            />
          </div>
          <div className="dsh-example-actions">
            <Button type="submit" disabled={status === 'saving' || draft.displayName.trim() === ''}>
              {t(status === 'saving' ? 'saving' : 'save')}
            </Button>
            {status === 'saved' && <p role="status">{t('saved')}</p>}
            {status === 'saveError' && <p role="alert">{t('saveError')}</p>}
          </div>
          {draft.showStatus && draft.displayName.trim() && (
            <p className="dsh-example-summary">{t('active').replace('{name}', () => draft.displayName.trim())}</p>
          )}
        </form>
      )}
    </section>
  )
}

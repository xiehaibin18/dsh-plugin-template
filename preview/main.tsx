import { PreviewAppearanceControls, type PreviewLanguage, type PreviewTheme } from '@xiehaibin18/dsh-plugin-dev/appearance'
import { useEffect, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MESSAGES } from '../src/client/messages.js'
import { SettingsPanel } from '../src/client/SettingsPanel.js'
import '../src/client/styles.css'
import './preview.css'

function Preview() {
  const [language, setLanguage] = useState<PreviewLanguage>('zh')
  const [theme, setTheme] = useState<PreviewTheme>('light')

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.style.colorScheme = theme
    document.body.toggleAttribute('data-ds-dark-theme', theme === 'dark')
  }, [language, theme])

  return (
    <main className="preview-page">
      <div className="preview-controls">
        <PreviewAppearanceControls language={language} theme={theme} onLanguageChange={setLanguage} onThemeChange={setTheme} />
      </div>
      <SettingsPanel t={(key) => MESSAGES[language][key]} />
    </main>
  )
}

const container = document.getElementById('root')
if (!container) throw new Error('Missing preview root')

const hotState = import.meta.hot.data as { root?: Root }
const root = (hotState.root ??= createRoot(container))
root.render(<Preview />)

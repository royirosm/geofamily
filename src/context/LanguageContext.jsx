// LanguageContext.jsx
// Provides the active language ('en' | 'el') and translation helpers.
//
// Usage:
//   const { lang, setLang, t, tLang } = useLanguage()
//   t('quizCorrect')          → uses active language
//   tLang('quizCorrect', 'el') → uses explicit language (for frozen quiz screens)

import { createContext, useContext, useState } from 'react'
import translations from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('geofamily_lang') || 'en'
  )

  function switchLang(newLang) {
    setLang(newLang)
    localStorage.setItem('geofamily_lang', newLang)
  }

  // t('key') — uses the current active language
  function t(key) {
    return translations[key]?.[lang] ?? translations[key]?.en ?? key
  }

  // tLang('key', 'el') — uses an explicit language override.
  // Use this inside quiz screens that freeze lang at start, so that
  // toggling the navbar mid-game doesn't change quiz UI strings.
  function tLang(key, explicitLang) {
    return translations[key]?.[explicitLang] ?? translations[key]?.en ?? key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLang, t, tLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}

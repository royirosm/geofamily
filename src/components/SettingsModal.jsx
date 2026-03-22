// SettingsModal.jsx
// Overlay modal for app settings.
// Sections:
//   1. Questions per round picker (5 / 10 / 15 / 20)
//   2. Family code — enter or generate a code to link devices on the leaderboard
//
// Family code logic:
//   - No active code → show input + Generate + Save
//   - Active code    → show code card + Leave family only (no input, no generate, no save)

import { useState }                          from 'react'
import { useLanguage }                       from '../context/LanguageContext'
import { useSettings, generateFamilyCode }   from '../context/SettingsContext'

export default function SettingsModal({ onClose }) {
  const { t }                                            = useLanguage()
  const { questionsPerRound, setQuestionsPerRound,
          familyCode, setFamilyCode, clearFamilyCode }  = useSettings()

  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeSaved, setCodeSaved] = useState(false)

  const options = [5, 10, 15, 20]
  const hasCode = familyCode.length > 0

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleGenerate() {
    const code = generateFamilyCode()
    setCodeInput(code)
    setCodeError('')
  }

  function handleSave() {
    const trimmed = codeInput.trim().toUpperCase()
    if (trimmed.length < 3) {
      setCodeError(t('settingsFamilyCodeTooShort'))
      return
    }
    setCodeError('')
    setFamilyCode(trimmed)
    setCodeSaved(true)
    setTimeout(() => setCodeSaved(false), 2000)
  }

  function handleLeave() {
    clearFamilyCode()
    setCodeInput('')
    setCodeError('')
    setCodeSaved(false)
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-6"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-gray-800 text-xl">
            ⚙️ {t('settings')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* ── Questions per round ── */}
        <div>
          <p className="font-semibold text-gray-600 text-sm mb-3">
            {t('settingsQuestionsPerRound')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {options.map(n => (
              <button
                key={n}
                onClick={() => setQuestionsPerRound(n)}
                className={`
                  py-3 rounded-xl font-bold text-base transition-all duration-200
                  ${questionsPerRound === n
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100" />

        {/* ── Family code ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-600 text-sm">
              🏠 {t('settingsFamilyCode')}
            </p>
            {hasCode && (
              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                {t('settingsFamilyCodeActive')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {t('settingsFamilyCodeHint')}
          </p>

          {hasCode ? (
            /* ── Active state: code card + Leave button only ── */
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="font-mono font-extrabold text-blue-600 tracking-widest text-xl leading-none">
                {familyCode}
              </p>
              <button
                onClick={handleLeave}
                className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors ml-4 flex-shrink-0"
              >
                {t('settingsFamilyCodeClear')}
              </button>
            </div>
          ) : (
            /* ── No code: input + Generate + Save ── */
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={e => {
                    setCodeInput(e.target.value.toUpperCase())
                    setCodeError('')
                  }}
                  placeholder={t('settingsFamilyCodePlaceholder')}
                  maxLength={10}
                  className="flex-1 border-2 border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2 text-sm font-mono font-bold text-gray-700 outline-none transition-colors uppercase tracking-widest"
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-colors"
                >
                  {codeSaved ? '✓' : t('settingsFamilyCodeSave')}
                </button>
              </div>

              {codeError && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{codeError}</p>
              )}

              <button
                onClick={handleGenerate}
                className="mt-3 text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors"
              >
                🎲 {t('settingsFamilyCodeGenerate')}
              </button>
            </>
          )}
        </div>

        {/* ── Done ── */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          {t('settingsDone')}
        </button>

      </div>
    </div>
  )
}

// SettingsModal.jsx
// Simple overlay modal for app settings.
// Currently: choose number of questions per round (5 / 10 / 15 / 20).
// Persists choice to localStorage so it survives page reloads.
// More settings can be added here in future phases.

import { useLanguage } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'

export default function SettingsModal({ onClose }) {
  const { t } = useLanguage()
  const { questionsPerRound, setQuestionsPerRound } = useSettings()

  const options = [5, 10, 15, 20]

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
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

        {/* Questions per round */}
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

        {/* Done button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          {t('settingsDone')}
        </button>
      </div>
    </div>
  )
}

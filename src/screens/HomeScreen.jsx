// HomeScreen.jsx
// Landing page. Shows app title and available quiz modules.
// On Play, snapshots current lang + ageMode into route state so the
// quiz uses those frozen values for the entire round.

import { useNavigate }    from 'react-router-dom'
import { useLanguage }    from '../context/LanguageContext'
import { useAgeMode }     from '../context/AgeModeContext'

const modules = [
  {
    key:       'capitals',
    labelKey:  'modulesCapitals',
    emoji:     '🏛️',
    color:     'from-blue-500 to-indigo-600',
    available: true,
  },
  {
    key:       'flags',
    labelKey:  'modulesFlags',
    emoji:     '🚩',
    color:     'from-rose-400 to-pink-600',
    available: false,
  },
  {
    key:       'cities',
    labelKey:  'modulesCities',
    emoji:     '🏙️',
    color:     'from-amber-400 to-orange-500',
    available: false,
  },
  {
    key:       'map-quiz',
    labelKey:  'modulesMapQuiz',
    emoji:     '🗺️',
    color:     'from-emerald-400 to-teal-600',
    available: false,
  },
]

export default function HomeScreen() {
  const navigate            = useNavigate()
  const { lang, t }         = useLanguage()
  const { ageMode, isKids } = useAgeMode()

  function handleStartQuiz(moduleKey) {
    // Snapshot lang + ageMode at the moment Play is pressed.
    // MultipleChoice reads these frozen values for the whole round.
    // Toggling the navbar mid-game won't restart the quiz.
    navigate(`/quiz/${moduleKey}`, {
      state: { lang, ageMode },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Hero */}
      <div className="text-center pt-16 pb-10 px-4">
        <div className={`text-6xl mb-4 ${isKids ? 'animate-bounce' : ''}`}>🌍</div>
        <h1 className={`font-extrabold text-gray-800 mb-2 ${isKids ? 'text-4xl' : 'text-3xl'}`}>
          {t('homeTitle')}
        </h1>
        <p className={`text-gray-500 ${isKids ? 'text-xl' : 'text-base'}`}>
          {t('homeSubtitle')}
        </p>
      </div>

      {/* Module grid */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <p className={`text-center font-semibold text-gray-400 uppercase tracking-widest mb-6 ${isKids ? 'text-base' : 'text-xs'}`}>
          {t('chooseModule')}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {modules.map(mod => (
            <ModuleCard
              key={mod.key}
              mod={mod}
              label={t(mod.labelKey)}
              isKids={isKids}
              onStart={() => mod.available && handleStartQuiz(mod.key)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ModuleCard({ mod, label, isKids, onStart }) {
  return (
    <button
      onClick={onStart}
      disabled={!mod.available}
      className={`
        relative rounded-2xl p-6 text-left
        transition-all duration-200
        ${mod.available
          ? `bg-gradient-to-br ${mod.color} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 cursor-pointer`
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      <div className={`mb-3 ${isKids ? 'text-5xl' : 'text-4xl'}`}>{mod.emoji}</div>
      <div className={`font-bold ${isKids ? 'text-xl' : 'text-lg'}`}>{label}</div>
      {!mod.available && (
        <div className="absolute top-3 right-3 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
          Soon
        </div>
      )}
    </button>
  )
}

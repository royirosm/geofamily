// HomeScreen.jsx
// Landing page. Shows the control strip (age mode, language, settings,
// switch player) that previously lived in the navbar. Also fixes the
// vertical scroll issue by using h-[100dvh] + overflow-y-auto instead
// of min-h-screen, so the browser's own chrome doesn't cause a phantom
// scrollable region on mobile.

import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { useLanguage }    from '../context/LanguageContext'
import { useAgeMode }     from '../context/AgeModeContext'
import { usePlayer }      from '../context/PlayerContext'
import { getBg }          from './PlayerSelectScreen'
import SettingsModal      from '../components/SettingsModal'
import PlayerSelectScreen from './PlayerSelectScreen'

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
  const navigate              = useNavigate()
  const { lang, setLang, t }  = useLanguage()
  const { ageMode, setAgeMode, isKids } = useAgeMode()
  const { activePlayer }      = usePlayer()
  const [showSettings,      setShowSettings]      = useState(false)
  const [showPlayerSelect,  setShowPlayerSelect]  = useState(false)

  const bg = activePlayer ? getBg(activePlayer.avatarBg) : null

  function handleStartQuiz(moduleKey) {
    navigate(`/quiz/${moduleKey}`, { state: { lang, ageMode } })
  }

  return (
    // h-[100dvh] accounts for mobile browser chrome (address bar, bottom bar).
    // overflow-y-auto allows scrolling only if content genuinely overflows.
    <div className="h-[100dvh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">

      {/* ── Control strip ────────────────────────────────────────────── */}
      {/* Replaces the controls that were previously in the navbar.      */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 max-w-2xl mx-auto">

        {/* Age mode toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-0.5 gap-0.5 shadow-sm">
          <ModeButton
            active={ageMode === 'kids'}
            onClick={() => setAgeMode('kids')}
            activeClass="bg-yellow-400 text-yellow-900"
            label={t('kidsMode')}
          >
            🧒
          </ModeButton>
          <ModeButton
            active={ageMode === 'explorer'}
            onClick={() => setAgeMode('explorer')}
            activeClass="bg-blue-500 text-white"
            label={t('explorerMode')}
          >
            🧭
          </ModeButton>
        </div>

        {/* Right side: lang + player-switch + settings */}
        <div className="flex items-center gap-2">

          {/* Language toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-full p-0.5 gap-0.5 shadow-sm">
            <ModeButton
              active={lang === 'en'}
              onClick={() => setLang('en')}
              activeClass="bg-gray-800 text-white"
              label="English"
            >
              <span className="text-xs font-bold">EN</span>
            </ModeButton>
            <ModeButton
              active={lang === 'el'}
              onClick={() => setLang('el')}
              activeClass="bg-gray-800 text-white"
              label="Ελληνικά"
            >
              <span className="text-xs font-bold">ΕΛ</span>
            </ModeButton>
          </div>

          {/* Switch player */}
          {activePlayer && (
            <button
              onClick={() => setShowPlayerSelect(true)}
              className="flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-1 pr-2.5 py-0.5 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label={t('playerSwitch')}
            >
              <div className={`w-6 h-6 rounded-full ${bg.bg} flex items-center justify-center flex-shrink-0`}>
                <span className="text-sm leading-none">{activePlayer.avatar}</span>
              </div>
              <span className="text-xs font-bold text-gray-600">↔</span>
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-base"
            aria-label={t('settings')}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="text-center pt-8 pb-8 px-4">
        <div className={`text-6xl mb-4 ${isKids ? 'animate-bounce' : ''}`}>🌍</div>
        <h1 className={`font-extrabold text-gray-800 mb-2 ${isKids ? 'text-4xl' : 'text-3xl'}`}>
          {t('homeTitle')}
        </h1>
        <p className={`text-gray-500 ${isKids ? 'text-xl' : 'text-base'}`}>
          {t('homeSubtitle')}
        </p>
      </div>

      {/* ── Module grid ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
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

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showPlayerSelect && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <PlayerSelectScreen onDone={() => setShowPlayerSelect(false)} />
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModeButton({ active, onClick, activeClass, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-8 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
        active ? activeClass : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
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
          ? `bg-gradient-to-br ${mod.color} text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95`
          : 'bg-white border-2 border-dashed border-gray-200 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      <div className={`mb-3 ${isKids ? 'text-5xl' : 'text-4xl'}`}>{mod.emoji}</div>
      <div className={`font-bold leading-tight ${isKids ? 'text-xl' : 'text-base'}`}>{label}</div>
      {!mod.available && (
        <div className="absolute top-2 right-2 text-xs bg-gray-100 text-gray-400 rounded-full px-2 py-0.5 font-medium">
          Soon
        </div>
      )}
    </button>
  )
}

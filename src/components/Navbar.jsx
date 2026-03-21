// Navbar.jsx
// Top navigation bar — always visible.
// Mobile-optimised: icon-only age toggle + compact EN/EL pill to fit in one row.
// Logo click navigates home.
// Player chip (avatar + name) — tap to open player switcher overlay.
// Gear icon opens Settings modal (questions per round).
// Toggles are disabled during a quiz (/quiz/*) to prevent mid-game changes.

import { useState }      from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage }   from '../context/LanguageContext'
import { useAgeMode }    from '../context/AgeModeContext'
import { usePlayer }     from '../context/PlayerContext'
import SettingsModal     from './SettingsModal'
import PlayerSelectScreen from '../screens/PlayerSelectScreen'

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { ageMode, setAgeMode } = useAgeMode()
  const { activePlayer }  = usePlayer()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [showPlayerSelect, setShowPlayerSelect] = useState(false)

  // Disable toggles on any quiz route
  const inQuiz = location.pathname.startsWith('/quiz')

  return (
    <>
      <nav className="
        w-full px-3 py-2
        flex items-center justify-between gap-2
        bg-white border-b border-gray-100
        sticky top-0 z-50
      ">
        {/* Logo — clickable, navigates home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity"
          aria-label="Go home"
        >
          <span className="text-xl">🌍</span>
          <span className="font-bold text-base text-gray-800 tracking-tight leading-none">
            {t('appName')}
          </span>
        </button>

        {/* Right side controls */}
        <div className={`flex items-center gap-1.5 transition-opacity duration-200 ${inQuiz ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

          {/* Age mode toggle — icon only */}
          <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
            <IconToggle
              active={ageMode === 'kids'}
              onClick={() => setAgeMode('kids')}
              activeClass="bg-yellow-400 text-yellow-900"
              label={t('kidsMode')}
            >
              🧒
            </IconToggle>
            <IconToggle
              active={ageMode === 'explorer'}
              onClick={() => setAgeMode('explorer')}
              activeClass="bg-blue-500 text-white"
              label={t('explorerMode')}
            >
              🧭
            </IconToggle>
          </div>

          {/* Language toggle */}
          <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
            <IconToggle
              active={lang === 'en'}
              onClick={() => setLang('en')}
              activeClass="bg-white text-gray-800 shadow-sm"
              label="English"
            >
              <span className="text-xs font-bold">EN</span>
            </IconToggle>
            <IconToggle
              active={lang === 'el'}
              onClick={() => setLang('el')}
              activeClass="bg-white text-gray-800 shadow-sm"
              label="Ελληνικά"
            >
              <span className="text-xs font-bold">ΕΛ</span>
            </IconToggle>
          </div>

          {/* Player chip */}
          {activePlayer && (
            <button
              onClick={() => setShowPlayerSelect(true)}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full pl-1 pr-2 py-0.5 transition-colors"
              aria-label={t('playerSwitch')}
            >
              <span className="text-lg leading-none">{activePlayer.avatar}</span>
              <span className="text-xs font-bold text-gray-700 max-w-[60px] truncate">
                {activePlayer.name}
              </span>
            </button>
          )}

          {/* Settings gear */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700 text-base"
            aria-label={t('settings')}
          >
            ⚙️
          </button>
        </div>
      </nav>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Player switcher — full-screen overlay */}
      {showPlayerSelect && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <PlayerSelectScreen onDone={() => setShowPlayerSelect(false)} />
        </div>
      )}
    </>
  )
}

// Compact square-ish toggle button for icons / short text
function IconToggle({ active, onClick, activeClass, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        w-8 h-7 flex items-center justify-center
        rounded-full text-sm font-medium
        transition-all duration-200
        ${active ? activeClass : 'text-gray-500 hover:text-gray-700'}
      `}
    >
      {children}
    </button>
  )
}

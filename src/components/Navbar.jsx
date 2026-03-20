// Navbar.jsx
// Top navigation bar — always visible.
// Toggles are disabled during a quiz (/quiz/*) to prevent mid-game changes.

import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAgeMode }  from '../context/AgeModeContext'

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { ageMode, setAgeMode } = useAgeMode()
  const location = useLocation()

  // Disable toggles on any quiz route
  const inQuiz = location.pathname.startsWith('/quiz')

  return (
    <nav className="
      w-full px-4 py-3
      flex items-center justify-between
      bg-white border-b border-gray-100
      sticky top-0 z-50
    ">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌍</span>
        <span className="font-bold text-lg text-gray-800 tracking-tight">
          {t('appName')}
        </span>
      </div>

      {/* Right side controls */}
      <div className={`flex items-center gap-2 transition-opacity duration-200 ${inQuiz ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

        {/* Age mode toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
          <ToggleButton
            active={ageMode === 'kids'}
            onClick={() => setAgeMode('kids')}
            activeClass="bg-yellow-400 text-yellow-900"
          >
            🧒 {t('kidsMode')}
          </ToggleButton>
          <ToggleButton
            active={ageMode === 'explorer'}
            onClick={() => setAgeMode('explorer')}
            activeClass="bg-blue-500 text-white"
          >
            🧭 {t('explorerMode')}
          </ToggleButton>
        </div>

        {/* Language toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
          <ToggleButton
            active={lang === 'en'}
            onClick={() => setLang('en')}
            activeClass="bg-white text-gray-800 shadow-sm"
          >
            EN
          </ToggleButton>
          <ToggleButton
            active={lang === 'el'}
            onClick={() => setLang('el')}
            activeClass="bg-white text-gray-800 shadow-sm"
          >
            ΕΛ
          </ToggleButton>
        </div>

      </div>
    </nav>
  )
}

function ToggleButton({ active, onClick, activeClass, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1 rounded-full text-sm font-medium
        transition-all duration-200
        ${active ? activeClass : 'text-gray-500 hover:text-gray-700'}
      `}
    >
      {children}
    </button>
  )
}

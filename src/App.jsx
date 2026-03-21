// App.jsx
// Root component. Uses React Router for navigation between screens.
// Providers (outermost → innermost):
//   LanguageProvider → AgeModeProvider → SettingsProvider → PlayerProvider
//
// Launch logic:
//   If no active player is set → show PlayerSelectScreen (blocks everything else)
//   Once a player is selected → show the normal app (Navbar + Routes)
//
// Routes:
//   /                → HomeScreen
//   /quiz/capitals   → MultipleChoice (Capitals module)
//   /results         → ResultsScreen

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useCountries }      from './hooks/useCountries'
import { useLanguage }       from './context/LanguageContext'
import { usePlayer }         from './context/PlayerContext'
import { SettingsProvider }  from './context/SettingsContext'
import { PlayerProvider }    from './context/PlayerContext'
import Navbar                from './components/Navbar'
import HomeScreen            from './screens/HomeScreen'
import PlayerSelectScreen    from './screens/PlayerSelectScreen'
import MultipleChoice        from './modules/capitals/MultipleChoice'
import ResultsScreen         from './screens/ResultsScreen'

// Inner component — has access to all contexts
function AppContent() {
  const { countries, loading, error } = useCountries()
  const { t }            = useLanguage()
  const { activePlayer } = usePlayer()

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">🌍</div>
          <p className="text-gray-500 text-lg">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-red-500 text-lg">{t('error')}</p>
        </div>
      </div>
    )
  }

  // ── No active player → show player select (no Navbar, no routes) ──────────
  if (!activePlayer) {
    return <PlayerSelectScreen onDone={() => {}} />
  }

  // ── Normal app ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/"               element={<HomeScreen />} />
        <Route path="/quiz/capitals"  element={<MultipleChoice countries={countries} />} />
        <Route path="/results"        element={<ResultsScreen />} />
        <Route path="*"               element={<HomeScreen />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}

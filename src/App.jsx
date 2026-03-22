// App.jsx
// Root component. Uses React Router for navigation between screens.
// Providers: LanguageProvider → AgeModeProvider → SettingsProvider → PlayerProvider
//
// Routes:
//   /            → HomeScreen
//   /quiz/capitals → MultipleChoice
//   /results     → ResultsScreen
//   /stats       → StatsScreen
//   /leaderboard → LeaderboardScreen  ← Phase 4

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useCountries }       from './hooks/useCountries'
import { useLanguage }        from './context/LanguageContext'
import { usePlayer }          from './context/PlayerContext'
import { SettingsProvider }   from './context/SettingsContext'
import { PlayerProvider }     from './context/PlayerContext'
import Navbar                 from './components/Navbar'
import HomeScreen             from './screens/HomeScreen'
import PlayerSelectScreen     from './screens/PlayerSelectScreen'
import MultipleChoice         from './modules/capitals/MultipleChoice'
import ResultsScreen          from './screens/ResultsScreen'
import StatsScreen            from './screens/StatsScreen'
import LeaderboardScreen      from './screens/LeaderboardScreen'

function AppContent() {
  const { countries, loading, error } = useCountries()
  const { t }            = useLanguage()
  const { activePlayer } = usePlayer()

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

  if (!activePlayer) {
    return <PlayerSelectScreen onDone={() => {}} />
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/"              element={<HomeScreen />} />
        <Route path="/quiz/capitals" element={<MultipleChoice countries={countries} />} />
        <Route path="/results"       element={<ResultsScreen />} />
        <Route path="/stats"         element={<StatsScreen countries={countries} />} />
        <Route path="/leaderboard"   element={<LeaderboardScreen />} />
        <Route path="*"              element={<HomeScreen />} />
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

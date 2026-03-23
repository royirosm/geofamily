// src/App.jsx
// Phase 6 complete: all multiple-choice, type-answer, and flashcard routes

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useCountries }       from './hooks/useCountries'
import { useLanguage }        from './context/LanguageContext'
import { usePlayer }          from './context/PlayerContext'
import { SettingsProvider }   from './context/SettingsContext'
import { PlayerProvider }     from './context/PlayerContext'
import Navbar                 from './components/Navbar'
import HomeScreen             from './screens/HomeScreen'
import PlayerSelectScreen     from './screens/PlayerSelectScreen'
import ModuleSelectScreen     from './screens/ModuleSelectScreen'
import ResultsScreen          from './screens/ResultsScreen'
import StatsScreen            from './screens/StatsScreen'
import LeaderboardScreen      from './screens/LeaderboardScreen'

// ── Capitals / find-capital ───────────────────────────────────────────────────
import CapitalsFindCapitalMC  from './modules/capitals/find-capital/MultipleChoice'
import CapitalsFindCapitalTA  from './modules/capitals/find-capital/TypeAnswer'
import CapitalsFindCapitalFC  from './modules/capitals/find-capital/Flashcard'

// ── Capitals / find-country ───────────────────────────────────────────────────
import CapitalsFindCountryMC  from './modules/capitals/find-country/MultipleChoice'
import CapitalsFindCountryTA  from './modules/capitals/find-country/TypeAnswer'
import CapitalsFindCountryFC  from './modules/capitals/find-country/Flashcard'

// ── Flags / flag-to-country ───────────────────────────────────────────────────
import FlagsFlagToCountryMC   from './modules/flags/flag-to-country/MultipleChoice'
import FlagsFlagToCountryTA   from './modules/flags/flag-to-country/TypeAnswer'
import FlagsFlagToCountryFC   from './modules/flags/flag-to-country/Flashcard'

// ── Flags / country-to-flag ───────────────────────────────────────────────────
import FlagsCountryToFlagMC   from './modules/flags/country-to-flag/MultipleChoice'
import FlagsCountryToFlagFC   from './modules/flags/country-to-flag/Flashcard'

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
        {/* ── Core screens ── */}
        <Route path="/"            element={<HomeScreen />} />
        <Route path="/results"     element={<ResultsScreen />} />
        <Route path="/stats"       element={<StatsScreen countries={countries} />} />
        <Route path="/leaderboard" element={<LeaderboardScreen />} />

        {/* ── Module selector ── */}
        <Route path="/module/:moduleId" element={<ModuleSelectScreen />} />

        {/* ── Capitals / find-capital ── */}
        <Route path="/quiz/capitals/find-capital/multiple-choice" element={<CapitalsFindCapitalMC countries={countries} />} />
        <Route path="/quiz/capitals/find-capital/type-answer"     element={<CapitalsFindCapitalTA countries={countries} />} />
        <Route path="/quiz/capitals/find-capital/flashcard"       element={<CapitalsFindCapitalFC countries={countries} />} />

        {/* ── Capitals / find-country ── */}
        <Route path="/quiz/capitals/find-country/multiple-choice" element={<CapitalsFindCountryMC countries={countries} />} />
        <Route path="/quiz/capitals/find-country/type-answer"     element={<CapitalsFindCountryTA countries={countries} />} />
        <Route path="/quiz/capitals/find-country/flashcard"       element={<CapitalsFindCountryFC countries={countries} />} />

        {/* ── Flags / flag-to-country ── */}
        <Route path="/quiz/flags/flag-to-country/multiple-choice" element={<FlagsFlagToCountryMC countries={countries} />} />
        <Route path="/quiz/flags/flag-to-country/type-answer"     element={<FlagsFlagToCountryTA countries={countries} />} />
        <Route path="/quiz/flags/flag-to-country/flashcard"       element={<FlagsFlagToCountryFC countries={countries} />} />

        {/* ── Flags / country-to-flag ── */}
        <Route path="/quiz/flags/country-to-flag/multiple-choice" element={<FlagsCountryToFlagMC countries={countries} />} />
        <Route path="/quiz/flags/country-to-flag/flashcard"       element={<FlagsCountryToFlagFC countries={countries} />} />

        {/* ── Legacy route (backwards compat) ── */}
        <Route path="/quiz/capitals" element={<CapitalsFindCapitalMC countries={countries} />} />

        <Route path="*" element={<HomeScreen />} />
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

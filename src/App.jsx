// src/App.jsx
// Phase 8A: calls syncOnOpen() once on mount to pull Firestore data

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect }          from 'react'
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

// ── Sovereignty / country-or-territory ───────────────────────────────────────
import SovereigntyBinary          from './modules/sovereignty/country-or-territory/SovereigntyBinary'

// ── Sovereignty / find-sovereign ─────────────────────────────────────────────
import SovereigntyFindSovereignMC from './modules/sovereignty/find-sovereign/MultipleChoice'

// ── Currencies / find-currency ────────────────────────────────────────────
import CurrenciesFindCurrencyMC  from './modules/currencies/find-currency/MultipleChoice'
import CurrenciesFindCurrencyTA  from './modules/currencies/find-currency/TypeAnswer'
import CurrenciesFindCurrencyFC  from './modules/currencies/find-currency/Flashcard'

// ── Currencies / find-country ─────────────────────────────────────────────
import CurrenciesFindCountryMC   from './modules/currencies/find-country/MultipleChoice'
import CurrenciesFindCountryTA   from './modules/currencies/find-country/TypeAnswer'
import CurrenciesFindCountryFC   from './modules/currencies/find-country/Flashcard'

// ── Codes / find-code ─────────────────────────────────────────────────────
import CodesFindCodeMC           from './modules/codes/find-code/MultipleChoice'
import CodesFindCodeTA           from './modules/codes/find-code/TypeAnswer'
import CodesFindCodeFC           from './modules/codes/find-code/Flashcard'

// ── Codes / find-country ──────────────────────────────────────────────────
import CodesFindCountryMC        from './modules/codes/find-country/MultipleChoice'
import CodesFindCountryTA        from './modules/codes/find-country/TypeAnswer'
import CodesFindCountryFC        from './modules/codes/find-country/Flashcard'

// ── Regions / find-region ─────────────────────────────────────────────────
import RegionsFindRegionMC       from './modules/regions/find-region/MultipleChoice'
import RegionsFindRegionTA       from './modules/regions/find-region/TypeAnswer'
import RegionsFindRegionFC       from './modules/regions/find-region/Flashcard'

// ── Regions / find-country ────────────────────────────────────────────────
import RegionsFindCountryMC      from './modules/regions/find-country/MultipleChoice'
import RegionsFindCountryTA      from './modules/regions/find-country/TypeAnswer'
import RegionsFindCountryFC      from './modules/regions/find-country/Flashcard'

// ── Languages / find-language ─────────────────────────────────────────────
import LanguagesFindLanguageMC   from './modules/languages/find-language/MultipleChoice'
import LanguagesFindLanguageTA   from './modules/languages/find-language/TypeAnswer'
import LanguagesFindLanguageFC   from './modules/languages/find-language/Flashcard'

// ── Languages / find-country ──────────────────────────────────────────────
import LanguagesFindCountryMC    from './modules/languages/find-country/MultipleChoice'
import LanguagesFindCountryTA    from './modules/languages/find-country/TypeAnswer'
import LanguagesFindCountryFC    from './modules/languages/find-country/Flashcard'

// ── Cities / find-city ────────────────────────────────────────────────────
import CitiesFindCityMC          from './modules/cities/find-city/MultipleChoice'
import CitiesFindCityTA          from './modules/cities/find-city/TypeAnswer'
import CitiesFindCityFC          from './modules/cities/find-city/Flashcard'

// ── Cities / find-country ─────────────────────────────────────────────────
import CitiesFindCountryMC       from './modules/cities/find-country/MultipleChoice'
import CitiesFindCountryTA       from './modules/cities/find-country/TypeAnswer'
import CitiesFindCountryFC       from './modules/cities/find-country/Flashcard'

function AppContent() {
  const { countries, loading, error } = useCountries()
  const { t }              = useLanguage()
  const { activePlayer, syncOnOpen } = usePlayer()

  // 8A: pull + merge Firestore data once on app open
  useEffect(() => {
    syncOnOpen()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // run once on mount only

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

        {/* ── Sovereignty / country-or-territory ── */}
        <Route path="/quiz/sovereignty/country-or-territory/multiple-choice"
               element={<SovereigntyBinary countries={countries} />} />

        {/* ── Sovereignty / find-sovereign ── */}
        <Route path="/quiz/sovereignty/find-sovereign/multiple-choice"
               element={<SovereigntyFindSovereignMC countries={countries} />} />

        {/* ── Legacy route (backwards compat) ── */}
        <Route path="/quiz/capitals" element={<CapitalsFindCapitalMC countries={countries} />} />

        {/* ── Currencies / find-currency ── */}
        <Route path="/quiz/currencies/find-currency/multiple-choice" element={<CurrenciesFindCurrencyMC countries={countries} />} />
        <Route path="/quiz/currencies/find-currency/type-answer"     element={<CurrenciesFindCurrencyTA countries={countries} />} />
        <Route path="/quiz/currencies/find-currency/flashcard"       element={<CurrenciesFindCurrencyFC countries={countries} />} />

        {/* ── Currencies / find-country ── */}
        <Route path="/quiz/currencies/find-country/multiple-choice"  element={<CurrenciesFindCountryMC  countries={countries} />} />
        <Route path="/quiz/currencies/find-country/type-answer"      element={<CurrenciesFindCountryTA  countries={countries} />} />
        <Route path="/quiz/currencies/find-country/flashcard"        element={<CurrenciesFindCountryFC  countries={countries} />} />

        {/* ── Codes / find-code ── */}
        <Route path="/quiz/codes/find-code/multiple-choice"          element={<CodesFindCodeMC          countries={countries} />} />
        <Route path="/quiz/codes/find-code/type-answer"              element={<CodesFindCodeTA          countries={countries} />} />
        <Route path="/quiz/codes/find-code/flashcard"                element={<CodesFindCodeFC          countries={countries} />} />

        {/* ── Codes / find-country ── */}
        <Route path="/quiz/codes/find-country/multiple-choice"       element={<CodesFindCountryMC       countries={countries} />} />
        <Route path="/quiz/codes/find-country/type-answer"           element={<CodesFindCountryTA       countries={countries} />} />
        <Route path="/quiz/codes/find-country/flashcard"             element={<CodesFindCountryFC       countries={countries} />} />

        {/* ── Regions / find-region ── */}
        <Route path="/quiz/regions/find-region/multiple-choice"      element={<RegionsFindRegionMC      countries={countries} />} />
        <Route path="/quiz/regions/find-region/type-answer"          element={<RegionsFindRegionTA      countries={countries} />} />
        <Route path="/quiz/regions/find-region/flashcard"            element={<RegionsFindRegionFC      countries={countries} />} />

        {/* ── Regions / find-country ── */}
        <Route path="/quiz/regions/find-country/multiple-choice"     element={<RegionsFindCountryMC     countries={countries} />} />
        <Route path="/quiz/regions/find-country/type-answer"         element={<RegionsFindCountryTA     countries={countries} />} />
        <Route path="/quiz/regions/find-country/flashcard"           element={<RegionsFindCountryFC     countries={countries} />} />

        {/* ── Languages / find-language ── */}
        <Route path="/quiz/languages/find-language/multiple-choice" element={<LanguagesFindLanguageMC countries={countries} />} />
        <Route path="/quiz/languages/find-language/type-answer"     element={<LanguagesFindLanguageTA countries={countries} />} />
        <Route path="/quiz/languages/find-language/flashcard"       element={<LanguagesFindLanguageFC countries={countries} />} />

        {/* ── Languages / find-country ── */}
        <Route path="/quiz/languages/find-country/multiple-choice"  element={<LanguagesFindCountryMC  countries={countries} />} />
        <Route path="/quiz/languages/find-country/type-answer"      element={<LanguagesFindCountryTA  countries={countries} />} />
        <Route path="/quiz/languages/find-country/flashcard"        element={<LanguagesFindCountryFC  countries={countries} />} />

        {/* ── Cities / find-city ── */}
        <Route path="/quiz/cities/find-city/multiple-choice"        element={<CitiesFindCityMC        countries={countries} />} />
        <Route path="/quiz/cities/find-city/type-answer"            element={<CitiesFindCityTA        countries={countries} />} />
        <Route path="/quiz/cities/find-city/flashcard"              element={<CitiesFindCityFC        countries={countries} />} />

        {/* ── Cities / find-country ── */}
        <Route path="/quiz/cities/find-country/multiple-choice"     element={<CitiesFindCountryMC     countries={countries} />} />
        <Route path="/quiz/cities/find-country/type-answer"         element={<CitiesFindCountryTA     countries={countries} />} />
        <Route path="/quiz/cities/find-country/flashcard"           element={<CitiesFindCountryFC     countries={countries} />} />

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

// App.jsx
// Root component. Uses React Router for navigation between screens.
// Routes:
//   /                → HomeScreen
//   /quiz/capitals   → MultipleChoice (Capitals module)
//   /results         → ResultsScreen

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useCountries } from './hooks/useCountries'
import { useLanguage }  from './context/LanguageContext'
import Navbar           from './components/Navbar'
import HomeScreen       from './screens/HomeScreen'
import MultipleChoice   from './modules/capitals/MultipleChoice'
import ResultsScreen    from './screens/ResultsScreen'

function AppContent() {
  const { countries, loading, error } = useCountries()
  const { t } = useLanguage()

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
      <AppContent />
    </BrowserRouter>
  )
}

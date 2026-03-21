// ResultsScreen.jsx
// Shows score + per-question review after a quiz round.
// Phase 3: uses <FlagImage> in the review breakdown for offline fallback.
// Records the round via usePlayerProgress on mount.

import { useEffect, useRef }    from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage }          from '../context/LanguageContext'
import { useAgeMode }           from '../context/AgeModeContext'
import { usePlayerProgress }    from '../hooks/usePlayerProgress'
import FlagImage                from '../components/FlagImage'

export default function ResultsScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { tLang } = useLanguage()

  const {
    score     = 0,
    total     = 0,
    answers   = [],
    lang:     frozenLang    = 'en',
    ageMode:  frozenAgeMode = 'explorer',
    moduleId  = 'capitals',
  } = location.state ?? {}

  const isKids = frozenAgeMode === 'kids'
  const pct    = total > 0 ? Math.round((score / total) * 100) : 0

  const { recordRound } = usePlayerProgress(moduleId)
  const recorded        = useRef(false)

  useEffect(() => {
    if (!recorded.current && answers.length > 0) {
      recorded.current = true
      recordRound(answers, score, total)
    }
  }, [answers, score, total, recordRound])

  function getMessage() {
    if (pct === 100) return tLang('resultsPerfect',    frozenLang)
    if (pct >= 70)  return tLang('resultsGreat',       frozenLang)
    if (pct >= 40)  return tLang('resultsGood',        frozenLang)
    return                 tLang('resultsKeepTrying',  frozenLang)
  }

  const circumference = 2 * Math.PI * 40
  const strokeOffset  = circumference - (pct / 100) * circumference

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Score card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto mb-4 -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="text-center -mt-2 mb-4">
            <span className={`font-extrabold text-gray-800 ${isKids ? 'text-5xl' : 'text-4xl'}`}>{score}</span>
            <span className="text-gray-400 text-sm"> / {total}</span>
          </div>
          <h2 className={`font-extrabold text-gray-800 mb-2 ${isKids ? 'text-3xl' : 'text-2xl'}`}>
            {tLang('resultsTitle', frozenLang)}
          </h2>
          <p className={`text-gray-500 mb-8 ${isKids ? 'text-xl' : 'text-base'}`}>{getMessage()}</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/quiz/capitals', { state: { lang: frozenLang, ageMode: frozenAgeMode } })}
              className={`w-full rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all active:scale-95 ${isKids ? 'py-4 text-xl' : 'py-3 text-base'}`}
            >
              🔄 {tLang('tryAgain', frozenLang)}
            </button>
            <button
              onClick={() => navigate('/')}
              className={`w-full rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-95 ${isKids ? 'py-4 text-xl' : 'py-3 text-base'}`}
            >
              🏠 {tLang('home', frozenLang)}
            </button>
          </div>
        </div>

        {/* Question breakdown */}
        {answers.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className={`font-bold text-gray-700 ${isKids ? 'text-xl' : 'text-base'}`}>
                {tLang('resultsReview', frozenLang)}
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {answers.map((answer, i) => {
                const country = answer.question.country
                const correct = answer.correct
                return (
                  <div key={i} className={`flex items-center gap-4 px-6 py-4 ${correct ? 'bg-white' : 'bg-red-50'}`}>
                    {/* FlagImage with fallback */}
                    <div className="flex-shrink-0">
                      <FlagImage
                        src={country.flag}
                        alt={country.name[frozenLang]}
                        className="w-12 h-8"
                        isKids={isKids}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-800 truncate ${isKids ? 'text-lg' : 'text-sm'}`}>
                        {country.name[frozenLang]}
                      </p>
                      {correct
                        ? <p className={`text-green-600 ${isKids ? 'text-base' : 'text-xs'}`}>✓ {answer.chosen}</p>
                        : <p className={`text-red-500 ${isKids ? 'text-base' : 'text-xs'}`}>✗ {answer.chosen} → <strong>{answer.question.correctCapital}</strong></p>
                      }
                    </div>
                    <span className="text-xl flex-shrink-0">{correct ? '✅' : '❌'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

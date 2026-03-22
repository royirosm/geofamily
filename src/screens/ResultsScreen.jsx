// ResultsScreen.jsx
// Phase 4: passes mode to recordRound() and pushScore().

import { useEffect, useRef }        from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage }              from '../context/LanguageContext'
import { useAgeMode }               from '../context/AgeModeContext'
import { usePlayer }                from '../context/PlayerContext'
import { usePlayerProgress,
         getStatsForPlayer,
         getLevelForPlayer }        from '../hooks/usePlayerProgress'
import { useLeaderboard }           from '../hooks/useLeaderboard'
import FlagImage                    from '../components/FlagImage'

export default function ResultsScreen() {
  const location       = useLocation()
  const navigate       = useNavigate()
  const { tLang }      = useLanguage()
  const { activePlayer } = usePlayer()

  const {
    score     = 0,
    total     = 0,
    answers   = [],
    lang:     frozenLang    = 'en',
    ageMode:  frozenAgeMode = 'explorer',
    moduleId  = 'capitals',
    mode      = 'multiple-choice',
  } = location.state ?? {}

  const isKids = frozenAgeMode === 'kids'
  const pct    = total > 0 ? Math.round((score / total) * 100) : 0

  const { recordRound } = usePlayerProgress(moduleId)
  const { pushScore }   = useLeaderboard()
  const recorded        = useRef(false)

  useEffect(() => {
    if (!recorded.current && answers.length > 0) {
      recorded.current = true

      // 1. Save locally — pass mode so history entry is tagged
      recordRound(answers, score, total, mode)

      // 2. Push to Firebase after localStorage settles
      if (activePlayer) {
        setTimeout(() => {
          const stats = getStatsForPlayer(activePlayer.id)
          const level = getLevelForPlayer(activePlayer.id)
          pushScore(activePlayer, stats, level, moduleId, mode)
        }, 100)
      }
    }
  }, [answers, score, total, mode, recordRound, pushScore, activePlayer, moduleId])

  function getMessage() {
    if (pct === 100) return tLang('resultsPerfect',   frozenLang)
    if (pct >= 70)  return tLang('resultsGreat',      frozenLang)
    if (pct >= 40)  return tLang('resultsGood',       frozenLang)
    return                 tLang('resultsKeepTrying', frozenLang)
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
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeOffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="text-center -mt-2 mb-4">
            <span className={`font-extrabold text-gray-800 ${isKids ? 'text-5xl' : 'text-4xl'}`}>{score}</span>
            <span className="text-gray-400 text-sm"> / {total}</span>
          </div>
          <h2 className={`font-extrabold text-gray-800 mb-2 ${isKids ? 'text-2xl' : 'text-xl'}`}>
            {getMessage()}
          </h2>
          <p className="text-gray-400 text-sm">{pct}%</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className={`flex-1 rounded-2xl font-bold bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all ${isKids ? 'py-4 text-lg' : 'py-3 text-sm'}`}
          >
            🏠 {tLang('home', frozenLang)}
          </button>
          <button
            onClick={() => navigate(`/quiz/${moduleId}`, { state: { lang: frozenLang, ageMode: frozenAgeMode } })}
            className={`flex-1 rounded-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all ${isKids ? 'py-4 text-lg' : 'py-3 text-sm'}`}
          >
            🔄 {tLang('tryAgain', frozenLang)}
          </button>
        </div>

        {/* Per-question review */}
        {answers.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className={`font-extrabold text-gray-800 ${isKids ? 'text-xl' : 'text-base'}`}>
                {tLang('resultsReview', frozenLang)}
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {answers.map((ans, i) => {
                const country = ans.question.country
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <FlagImage
                      src={country.flag}
                      alt={country.name[frozenLang]}
                      className="w-12 h-8 object-cover rounded shadow-sm flex-shrink-0"
                      isKids={isKids}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-800 truncate ${isKids ? 'text-base' : 'text-sm'}`}>
                        {country.name[frozenLang] ?? country.name.en}
                      </p>
                      <p className={`text-gray-400 truncate ${isKids ? 'text-sm' : 'text-xs'}`}>
                        {ans.question.correctCapital}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {ans.correct
                        ? <span className="text-green-500 font-bold text-lg">✓</span>
                        : <div className="text-right">
                            <span className="text-red-400 font-bold text-lg">✗</span>
                            <p className={`text-red-400 ${isKids ? 'text-xs' : 'text-[10px]'} max-w-[80px] truncate`}>
                              {ans.chosen}
                            </p>
                          </div>
                      }
                    </div>
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

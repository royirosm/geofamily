// src/screens/ResultsScreen.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 7 additions:
//   - Kids unlock detection: compares global master count before/after recordRound
//   - Shows 🎉 celebration banner when a new batch of countries unlocks
//   - Updates geofamily_kids_seen_pool_{id} so HomeScreen badge clears correctly
//   - frozenAgeMode now handles 'familiar' and 'expert' (not just 'explorer')
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState }  from 'react'
import { useLocation, useNavigate }     from 'react-router-dom'
import { useLanguage }                  from '../context/LanguageContext'
import { usePlayer }                    from '../context/PlayerContext'
import {
  usePlayerProgress,
  getStatsForPlayer,
  getLevelForPlayer,
  getGlobalMasterCount,
}                                       from '../hooks/usePlayerProgress'
import { useLeaderboard }               from '../hooks/useLeaderboard'
import { getKidsUnlockInfo, getKidsPoolSize } from '../utils/questionGenerator'
import FlagImage                        from '../components/FlagImage'
import TerritoryBadge                   from '../components/TerritoryBadge'

export default function ResultsScreen() {
  const location       = useLocation()
  const navigate       = useNavigate()
  const { tLang }      = useLanguage()
  const { activePlayer } = usePlayer()

  const {
    score     = 0,
    total     = 0,
    answers   = [],
    lang:      frozenLang    = 'en',
    ageMode:   frozenAgeMode = 'expert',
    moduleId   = 'capitals',
    direction  = 'find-capital',
    mode       = 'multiple-choice',
    mistakes   = [],
  } = location.state ?? {}

  const isKids          = frozenAgeMode === 'kids'
  const pct             = total > 0 ? Math.round((score / total) * 100) : 0
  const isCountryToFlag = direction === 'country-to-flag'
  const isTypeAnswer    = mode === 'type-answer'
  const isSovereignty   = moduleId === 'sovereignty'

  const { recordRound } = usePlayerProgress(moduleId)
  const { pushScore }   = useLeaderboard()
  const recorded        = useRef(false)

  // Capture master count BEFORE recording — used to detect unlock crossings
  const mastersBefore = useRef(
    activePlayer ? getGlobalMasterCount(activePlayer.id) : 0
  )
  const [newUnlocks, setNewUnlocks] = useState(0)

  useEffect(() => {
    if (!recorded.current && answers.length > 0) {
      recorded.current = true
      recordRound(answers, score, total, mode, direction, mistakes)

      // Kids unlock detection — runs synchronously after recordRound writes localStorage
      if (isKids && activePlayer) {
        const mastersAfter = getGlobalMasterCount(activePlayer.id)
        const { newUnlocks: n } = getKidsUnlockInfo(mastersBefore.current, mastersAfter)
        if (n > 0) {
          setNewUnlocks(n)
          // Update the reference point so HomeScreen badge stays in sync
          localStorage.setItem(
            `geofamily_kids_seen_pool_${activePlayer.id}`,
            String(getKidsPoolSize(mastersAfter))
          )
        }
      }

      if (activePlayer) {
        setTimeout(() => {
          const stats = getStatsForPlayer(activePlayer.id)
          const level = getLevelForPlayer(activePlayer.id)
          pushScore(activePlayer, stats, level, moduleId, mode)
        }, 100)
      }
    }
  }, [answers, score, total, mode, direction, mistakes, recordRound, pushScore,
      activePlayer, moduleId, isKids])

  function getMessage() {
    if (pct === 100) return tLang('resultsPerfect',    frozenLang)
    if (pct >= 70)   return tLang('resultsGreat',      frozenLang)
    if (pct >= 40)   return tLang('resultsGood',       frozenLang)
    return                  tLang('resultsKeepTrying', frozenLang)
  }

  const circumference = 2 * Math.PI * 40
  const strokeOffset  = circumference - (pct / 100) * circumference

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* ── Score card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto mb-4 -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="text-center -mt-2 mb-4">
            <span className={`font-extrabold text-gray-800 ${isKids ? 'text-5xl' : 'text-4xl'}`}>
              {score}
            </span>
            <span className="text-gray-400 text-sm"> / {total}</span>
          </div>
          <h2 className={`font-extrabold text-gray-800 mb-2 ${isKids ? 'text-2xl' : 'text-xl'}`}>
            {getMessage()}
          </h2>
          <p className="text-gray-400 text-sm">{pct}%</p>
        </div>

        {/* ── Kids unlock celebration ────────────────────────────── */}
        {newUnlocks > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-5 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className={`font-extrabold text-yellow-800 ${isKids ? 'text-xl' : 'text-lg'}`}>
              {tLang('kidsUnlockedTitle', frozenLang)}
            </p>
            <p className={`text-yellow-600 mt-1 ${isKids ? 'text-base' : 'text-sm'}`}>
              {newUnlocks} {tLang('kidsUnlockedDesc', frozenLang)}
            </p>
          </div>
        )}

        {/* ── Action buttons ─────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className={`flex-1 rounded-2xl font-bold bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all ${isKids ? 'py-4 text-lg' : 'py-3 text-sm'}`}
          >
            🏠 {tLang('home', frozenLang)}
          </button>
          <button
            onClick={() => navigate(`/module/${moduleId}`, { state: { lang: frozenLang, ageMode: frozenAgeMode } })}
            className={`flex-1 rounded-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all ${isKids ? 'py-4 text-lg' : 'py-3 text-sm'}`}
          >
            🔄 {tLang('tryAgain', frozenLang)}
          </button>
        </div>

        {/* ── Per-question review ─────────────────────────────────── */}
        {answers.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className={`font-extrabold text-gray-800 ${isKids ? 'text-xl' : 'text-base'}`}>
                {tLang('resultsReview', frozenLang)}
              </h3>
            </div>

            <div className="divide-y divide-gray-50">
              {answers.map((ans, i) => {
                const country = ans.question?.country
                if (!country) return null

                const isClose    = ans.match === 'close'
                const isCorrect  = ans.correct

                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">

                    {/* Flag */}
                    <FlagImage
                      src={country.flag}
                      alt={country.name?.[frozenLang] ?? country.name?.en ?? ''}
                      className="w-12 h-8 object-cover rounded shadow-sm flex-shrink-0"
                      isKids={isKids}
                    />

                    {/* Country name + answer detail */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-800 truncate ${isKids ? 'text-base' : 'text-sm'}`}>
                        {country.name?.[frozenLang] ?? country.name?.en}
                      </p>

                      {/* country-to-flag: show the correct flag as thumbnail */}
                      {isCountryToFlag ? (
                        <div className="mt-0.5">
                          <FlagImage
                            src={ans.question.choices?.find(c => c.isCorrect)?.label ?? country.flag}
                            alt=""
                            className="w-8 h-5 object-cover rounded shadow-sm"
                            isKids={isKids}
                          />
                        </div>

                      ) : isSovereignty ? (
                        // Sovereignty: show correct answer (Country / Territory / sovereign name)
                        <div className="min-w-0 space-y-0.5">
                          <p className={`text-gray-400 truncate ${isKids ? 'text-sm' : 'text-xs'}`}>
                            ✓ {ans.question.correctAnswer}
                          </p>
                          {/* For territories, show the badge on wrong answers */}
                          {!isCorrect && country.sovereign && (
                            <TerritoryBadge
                              sovereign={country.sovereign}
                              lang={frozenLang}
                              isKids={isKids}
                            />
                          )}
                          {/* Show what was chosen if wrong */}
                          {!isCorrect && ans.chosen && (
                            <p className={`truncate text-red-400 ${isKids ? 'text-sm' : 'text-xs'}`}>
                              ✗ {ans.chosen}
                            </p>
                          )}
                        </div>

                      ) : (
                        // Standard: show correct answer + typed value for type-answer
                        <div className="min-w-0">
                          <p className={`text-gray-400 truncate ${isKids ? 'text-sm' : 'text-xs'}`}>
                            ✓ {ans.question.correctAnswer ?? ans.question.correctCapital}
                          </p>
                          {isTypeAnswer && !isCorrect && ans.chosen && (
                            <p className={`truncate ${isKids ? 'text-sm' : 'text-xs'} ${isClose ? 'text-amber-500' : 'text-red-400'}`}>
                              {tLang('typeAnswerYouTyped', frozenLang)} {ans.chosen}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Result icon */}
                    <div className="flex-shrink-0">
                      {isCorrect
                        ? <span className="text-green-500 text-lg font-bold">✓</span>
                        : isClose
                          ? <span className="text-amber-500 text-lg font-bold">~</span>
                          : <span className="text-red-400 text-lg font-bold">✗</span>
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

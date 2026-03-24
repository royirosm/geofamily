// src/modules/_shared/TypeAnswerBase.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8C: reads regionFilter from location.state, passes to generateFn as
//           the 7th argument: generateFn(countries, lang, ageMode, count,
//                                        progress, globalMasterCount=0, regionFilter)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate }    from 'react-router-dom'
import { useLanguage }                 from '../../context/LanguageContext'
import { useAgeMode }                  from '../../context/AgeModeContext'
import { useSettings }                 from '../../context/SettingsContext'
import { usePlayerProgress }           from '../../hooks/usePlayerProgress'
import { matchAnswer }                 from '../../utils/fuzzyMatch'

const ACCENT = {
  blue:   { progress: 'bg-blue-500',   submit: 'bg-blue-500 hover:bg-blue-600',     border: 'focus:border-blue-400',   ring: 'focus:ring-blue-200'   },
  indigo: { progress: 'bg-indigo-500', submit: 'bg-indigo-500 hover:bg-indigo-600', border: 'focus:border-indigo-400', ring: 'focus:ring-indigo-200' },
  rose:   { progress: 'bg-rose-500',   submit: 'bg-rose-500 hover:bg-rose-600',     border: 'focus:border-rose-400',   ring: 'focus:ring-rose-200'   },
}

const MODE = 'type-answer'

export default function TypeAnswerBase({ countries, config }) {
  const { moduleId, direction, accentColor = 'blue', generateFn, getQuestion } = config

  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
  const { questionsPerRound }      = useSettings()
  const { getProgress }            = usePlayerProgress(moduleId)

  const frozenLang         = location.state?.lang         ?? liveLang
  const frozenAgeMode      = location.state?.ageMode      ?? liveAgeMode
  const frozenRegionFilter = location.state?.regionFilter ?? 'all'   // 8C
  const isKidsFrozen       = frozenAgeMode === 'kids'
  const maxHints           = isKidsFrozen ? 3 : 1
  const accent             = ACCENT[accentColor] ?? ACCENT.blue

  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [typed, setTyped]                     = useState('')
  const [result, setResult]                   = useState(null)
  const [score, setScore]                     = useState(0)
  const [streak, setStreak]                   = useState(0)
  const [answers, setAnswers]                 = useState([])
  const [hintsUsed, setHintsUsed]             = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const submitRef = useRef(null)
  const generated = useRef(false)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      const progress = getProgress()
      // 8C: pass regionFilter as 7th argument
      setQuestions(generateFn(
        countries, frozenLang, frozenAgeMode, questionsPerRound,
        progress, 0, frozenRegionFilter,
      ))
    }
  }, [countries, frozenLang, frozenAgeMode, questionsPerRound, getProgress, generateFn, frozenRegionFilter])

  useEffect(() => {
    if (result === null && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [current, result])

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        {tLang('loading', frozenLang)}
      </div>
    )
  }

  const question    = questions[current]
  const isAnswered  = result !== null
  const isLastQ     = current === questions.length - 1
  const progressPct = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100
  const { stimulus, correctAnswer, stimulusLabel } = getQuestion(question, frozenLang)

  const canHint = !isAnswered && hintsUsed < maxHints

  function handleHint() {
    if (!canHint) return
    setHintsUsed(h => h + 1)
  }

  function handleSubmit() {
    if (isAnswered || !typed.trim()) return
    const { match, isCorrect } = matchAnswer(typed, correctAnswer)
    setResult(match)
    const correct = isCorrect
    setScore(s  => correct ? s + 1 : s)
    setStreak(s => correct ? s + 1 : 0)
    setAnswers(a => [...a, { question, correct, match, chosen: typed }])
  }

  submitRef.current = handleSubmit

  function handleKeyDown(e) {
    if (e.key === 'Enter') submitRef.current?.()
  }

  function handleNext() {
    if (isLastQ) {
      navigate('/results', {
        state: {
          score,
          total:     questions.length,
          answers,
          lang:      frozenLang,
          ageMode:   frozenAgeMode,
          moduleId,
          direction,
          mode:      MODE,
          mistakes:  answers.filter(a => !a.correct).map(a => a.question.country.code),
        },
      })
    } else {
      setCurrent(c => c + 1)
      setTyped('')
      setResult(null)
      setHintsUsed(0)
    }
  }

  // Hint letters
  const hintLetters = correctAnswer.slice(0, hintsUsed).split('')
  const hintDisplay = correctAnswer.split('').map((ch, i) =>
    i < hintsUsed ? ch : (ch === ' ' ? ' ' : '_')
  ).join(' ')

  // Feedback colours
  const feedbackBg    = result === 'correct' ? 'bg-green-50 border-green-200'
                      : result === 'close'   ? 'bg-amber-50 border-amber-200'
                      :                        'bg-red-50 border-red-200'
  const feedbackText  = result === 'correct' ? 'text-green-700'
                      : result === 'close'   ? 'text-amber-700'
                      :                        'text-red-600'

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">

      {/* ── Header bar ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className={`text-gray-400 hover:text-gray-600 font-semibold transition-colors ${isKidsFrozen ? 'text-base' : 'text-sm'}`}
          >
            ✕ {tLang('exitButtonLabel', frozenLang)}
          </button>
          <span className={`text-gray-500 font-semibold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {tLang('quizScore', frozenLang)}: {score}
            {streak >= 2 && <span className="ml-2 text-orange-500">🔥 {streak}</span>}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className={`${accent.progress} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progressPct}%` }} />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 pb-6 max-w-lg mx-auto w-full gap-4">

        {/* Stimulus (flag/name/capital) */}
        <div className="w-full flex justify-center">
          {stimulus}
        </div>

        {/* Hint display */}
        {hintsUsed > 0 && !isAnswered && (
          <p className={`text-center font-mono tracking-widest text-gray-500 ${isKidsFrozen ? 'text-2xl' : 'text-xl'}`}>
            {hintDisplay}
          </p>
        )}

        {/* Input area */}
        {!isAnswered && (
          <div className="w-full flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tLang('typeAnswerPlaceholder', frozenLang) ?? '…'}
              className={`
                w-full rounded-2xl border-2 bg-white font-semibold text-gray-800
                outline-none transition-all focus:ring-2
                ${accent.border} ${accent.ring}
                ${isKidsFrozen ? 'px-5 py-4 text-xl' : 'px-4 py-3 text-base'}
              `}
            />
            <div className="flex gap-2">
              <button
                onClick={() => submitRef.current?.()}
                disabled={!typed.trim()}
                className={`
                  flex-1 rounded-2xl font-extrabold text-white transition-all active:scale-95
                  ${accent.submit}
                  ${isKidsFrozen ? 'py-4 text-lg' : 'py-3 text-sm'}
                  ${!typed.trim() ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                {tLang('typeAnswerSubmit', frozenLang) ?? 'Submit'} ✓
              </button>
              {canHint && (
                <button
                  onClick={handleHint}
                  className={`
                    rounded-2xl border-2 border-gray-200 font-bold text-gray-500
                    hover:border-gray-300 transition-all active:scale-95
                    ${isKidsFrozen ? 'px-5 py-4 text-base' : 'px-4 py-3 text-sm'}
                  `}
                >
                  💡 {maxHints - hintsUsed}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {isAnswered && (
          <div className={`w-full rounded-2xl border p-4 ${feedbackBg}`}>
            <p className={`font-extrabold mb-1 ${feedbackText} ${isKidsFrozen ? 'text-xl' : 'text-base'}`}>
              {result === 'correct' ? tLang('quizCorrect', frozenLang)
               : result === 'close' ? (tLang('typeAnswerClose', frozenLang) ?? 'Almost!')
               : tLang('quizWrong', frozenLang)}
            </p>
            {result !== 'correct' && (
              <p className={`font-semibold ${feedbackText} ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
                {tLang('quizCorrectAnswer', frozenLang)}: <strong>{correctAnswer}</strong>
              </p>
            )}
          </div>
        )}

        {isAnswered && (
          <button
            onClick={handleNext}
            className={`
              w-full rounded-2xl font-extrabold text-white transition-all active:scale-95
              ${accent.submit}
              ${isKidsFrozen ? 'py-5 text-xl' : 'py-4 text-base'}
            `}
          >
            {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
          </button>
        )}
      </div>

      {/* ── Exit confirm ──────────────────────────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className={`font-extrabold text-gray-800 mb-2 ${isKidsFrozen ? 'text-xl' : 'text-lg'}`}>
              {tLang('exitTitle', frozenLang)}
            </p>
            <p className={`text-gray-500 mb-6 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {tLang('exitMessage', frozenLang)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`flex-1 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-300 transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
              >
                {tLang('exitCancel', frozenLang)}
              </button>
              <button
                onClick={() => navigate('/module/' + moduleId)}
                className={`flex-1 rounded-2xl bg-red-500 font-bold text-white hover:bg-red-600 transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
              >
                {tLang('exitConfirm', frozenLang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// src/modules/_shared/TypeAnswerBase.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared base component for all Type Answer quiz modes.
// Each direction (find-capital, find-country, flag-to-country) is a thin
// wrapper that passes its specific config here.
//
// Config shape:
//   moduleId    string   — e.g. 'capitals'
//   direction   string   — e.g. 'find-capital'
//   accentColor string   — tailwind color key, e.g. 'blue' | 'indigo' | 'rose'
//   generateFn  function — (countries, lang, ageMode, count, progress) => questions[]
//   getQuestion function — (question, lang) => { stimulus, correctAnswer, stimulusLabel }
//                          stimulus     = JSX rendered above the input
//                          correctAnswer = string to match against
//                          stimulusLabel = plain string for results review
//
// Hint system:
//   Kids mode:     up to 3 letters revealed, one per tap
//   Explorer mode: up to 1 letter revealed
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate }                 from 'react-router-dom'
import { useLanguage }                              from '../../context/LanguageContext'
import { useAgeMode }                               from '../../context/AgeModeContext'
import { useSettings }                              from '../../context/SettingsContext'
import { usePlayerProgress }                        from '../../hooks/usePlayerProgress'
import { matchAnswer } from '../../utils/fuzzyMatch'
import FlagImage                                    from '../../components/FlagImage'

// Tailwind colour maps — extend if new module colours are needed
const ACCENT = {
  blue:   { progress: 'bg-blue-500',   submit: 'bg-blue-500 hover:bg-blue-600',   border: 'focus:border-blue-400',   ring: 'focus:ring-blue-200'   },
  indigo: { progress: 'bg-indigo-500', submit: 'bg-indigo-500 hover:bg-indigo-600', border: 'focus:border-indigo-400', ring: 'focus:ring-indigo-200' },
  rose:   { progress: 'bg-rose-500',   submit: 'bg-rose-500 hover:bg-rose-600',   border: 'focus:border-rose-400',   ring: 'focus:ring-rose-200'   },
}

const MODE      = 'type-answer'

export default function TypeAnswerBase({ countries, config }) {
  const { moduleId, direction, accentColor = 'blue', generateFn, getQuestion } = config

  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
  const { questionsPerRound }      = useSettings()
  const { getProgress }            = usePlayerProgress(moduleId)

  const frozenLang    = location.state?.lang    ?? liveLang
  const frozenAgeMode = location.state?.ageMode ?? liveAgeMode
  const isKidsFrozen  = frozenAgeMode === 'kids'
  const maxHints      = isKidsFrozen ? 3 : 1
  const accent        = ACCENT[accentColor] ?? ACCENT.blue

  // ── State ──────────────────────────────────────────────────────────────────
  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [typed, setTyped]                     = useState('')
  const [result, setResult]                   = useState(null)   // null | 'correct' | 'close' | 'wrong'
  const [score, setScore]                     = useState(0)
  const [streak, setStreak]                   = useState(0)
  const [answers, setAnswers]                 = useState([])
  const [hintsUsed, setHintsUsed]             = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // ── Submit (plain function — no hooks after early return) ─────────────────
  // We use a ref to hold the latest submit logic so handleKeyDown always
  // calls the up-to-date version without needing useCallback.
  const submitRef  = useRef(null)
  const generated  = useRef(false)
  const inputRef   = useRef(null)

  // ── Generate questions ─────────────────────────────────────────────────────
  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      const progress = getProgress()
      setQuestions(generateFn(countries, frozenLang, frozenAgeMode, questionsPerRound, progress))
    }
  }, [countries, frozenLang, frozenAgeMode, questionsPerRound, getProgress, generateFn])

  // Auto-focus input after moving to next question
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

  const question        = questions[current]
  const isAnswered      = result !== null
  const isLastQ         = current === questions.length - 1
  const progressPct     = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100
  const { stimulus, correctAnswer, stimulusLabel } = getQuestion(question, frozenLang)

  // ── Hint system ────────────────────────────────────────────────────────────
  const canHint = !isAnswered && hintsUsed < maxHints

  function handleHint() {
    if (!canHint) return
    setHintsUsed(h => h + 1)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (isAnswered || !typed.trim()) return
    const { match, isCorrect } = matchAnswer(typed, correctAnswer)
    setResult(match)
    const correct = isCorrect
    setScore(s  => correct ? s + 1 : s)
    setStreak(s => correct ? s + 1 : 0)
    setAnswers(prev => [...prev, {
      question,
      chosen:  typed,
      correct,
      match,
    }])
  }

  // Keep ref in sync so handleKeyDown always calls the latest version
  submitRef.current = handleSubmit

  // Enter key submits — uses ref so it always calls latest handleSubmit
  function handleKeyDown(e) {
    if (e.key === 'Enter') submitRef.current?.()
  }

  // ── Next ───────────────────────────────────────────────────────────────────
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

  function handleExitConfirmed() {
    navigate(`/module/${moduleId}`, { state: { lang: frozenLang, ageMode: frozenAgeMode } })
  }

  // ── Feedback helpers ───────────────────────────────────────────────────────
  function getFeedback() {
    if (result === 'correct') return { text: tLang('quizCorrect', frozenLang),           color: 'text-green-600', icon: '✓' }
    if (result === 'close')   return { text: tLang('typeAnswerClose', frozenLang),        color: 'text-amber-500', icon: '~' }
    if (result === 'wrong')   return { text: tLang('quizCorrectAnswer', frozenLang) + ': ' + correctAnswer, color: 'text-red-500', icon: '✗' }
    return null
  }

  const feedback = getFeedback()

  // ── Input border colour by result state ───────────────────────────────────
  function inputBorderClass() {
    if (result === 'correct') return 'border-green-400 bg-green-50'
    if (result === 'close')   return 'border-amber-400 bg-amber-50'
    if (result === 'wrong')   return 'border-red-400 bg-red-50'
    return `border-gray-200 bg-white ${accent.border} focus:ring-2 ${accent.ring}`
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="w-full px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-sm font-semibold transition-colors"
          >
            <span className="text-xs">✕</span>
            {tLang('exitButtonLabel', frozenLang)}
          </button>
          <span className={`font-bold ${isKidsFrozen ? 'text-base' : 'text-sm'}`} style={{ color: 'inherit' }}>
            <span className={`text-${accentColor}-600`}>
              {tLang('quizScore', frozenLang)}: {score}
            </span>
            {streak >= 2 && <span className="ml-2 text-orange-500">🔥 {streak}</span>}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${accent.progress}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 pb-3 max-w-lg mx-auto w-full">

        {/* Question stimulus — rendered by config (flag image, country name, capital name, etc.) */}
        <div className="w-full mb-5 flex-shrink-0">
          {stimulus}
        </div>

        {/* Hint display — revealed letters as pill boxes */}
        {(hintsUsed > 0 || canHint) && (
          <div className="w-full mb-3 flex-shrink-0">
            {hintsUsed > 0 && (
              <div className="flex items-center gap-1.5 justify-center mb-2 flex-wrap">
                {correctAnswer.trim().split('').map((char, i) => {
                  const isRevealed = i < hintsUsed
                  const isSpace    = char === ' '
                  if (isSpace) return <span key={i} className="w-2" />
                  return (
                    <div
                      key={i}
                      className={`
                        flex items-center justify-center rounded-lg font-bold transition-all duration-300
                        ${isKidsFrozen ? 'w-9 h-10 text-lg' : 'w-8 h-9 text-base'}
                        ${isRevealed
                          ? 'bg-amber-100 border-2 border-amber-300 text-amber-700 scale-110'
                          : 'bg-gray-100 border-2 border-gray-200 text-transparent'
                        }
                      `}
                    >
                      {isRevealed ? char : '·'}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Text input */}
        <div className="w-full mb-3 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={e => !isAnswered && setTyped(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnswered}
            placeholder={tLang('typeAnswerPlaceholder', frozenLang)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`
              w-full rounded-2xl border-2 font-semibold outline-none transition-all duration-200
              ${isKidsFrozen ? 'px-5 py-4 text-xl' : 'px-4 py-3 text-base'}
              ${inputBorderClass()}
              ${isAnswered ? 'cursor-default' : ''}
            `}
          />
        </div>

        {/* Hint button (kids: up to 3, explorer: up to 1) */}
        {!isAnswered && (
          <div className="w-full mb-3 flex-shrink-0">
            <button
              onClick={handleHint}
              disabled={!canHint}
              className={`
                flex items-center gap-2 px-4 rounded-full font-semibold transition-all duration-200
                ${isKidsFrozen ? 'py-2.5 text-base' : 'py-2 text-sm'}
                ${canHint
                  ? 'bg-amber-50 border-2 border-amber-200 text-amber-700 hover:bg-amber-100 active:scale-95'
                  : 'bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed'
                }
              `}
            >
              <span>💡</span>
              <span>
                {canHint
                  ? `${tLang('typeAnswerHint', frozenLang)} (${maxHints - hintsUsed} ${tLang('typeAnswerHintLeft', frozenLang)})`
                  : tLang('typeAnswerHintMax', frozenLang)
                }
              </span>
            </button>
          </div>
        )}

        {/* Feedback row */}
        {isAnswered && feedback && (
          <div className="w-full mb-3 flex-shrink-0">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm`}>
              <span className={`font-extrabold text-xl flex-shrink-0 ${feedback.color}`}>{feedback.icon}</span>
              <p className={`font-bold flex-1 ${isKidsFrozen ? 'text-base' : 'text-sm'} ${feedback.color}`}>
                {result === 'correct' && feedback.text}
                {result === 'close'   && <>{feedback.text} — <span className="font-extrabold">{correctAnswer}</span></>}
                {result === 'wrong'   && feedback.text}
              </p>
            </div>
          </div>
        )}

        {/* Submit / Next button */}
        {!isAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={!typed.trim()}
            className={`
              w-full rounded-2xl font-extrabold text-white transition-all duration-200
              ${isKidsFrozen ? 'py-4 text-xl' : 'py-3 text-base'}
              ${typed.trim()
                ? `${accent.submit} shadow-md hover:shadow-lg active:scale-95`
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {tLang('typeAnswerSubmit', frozenLang)} ↵
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`
              w-full rounded-2xl font-extrabold text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-95
              ${isKidsFrozen ? 'py-4 text-xl' : 'py-3 text-base'}
              ${accent.submit}
            `}
          >
            {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
          </button>
        )}
      </div>

      {/* ── Exit dialog ─────────────────────────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🚪</div>
            <h3 className={`font-extrabold text-gray-800 mb-2 ${isKidsFrozen ? 'text-2xl' : 'text-xl'}`}>
              {tLang('exitTitle', frozenLang)}
            </h3>
            <p className={`text-gray-500 mb-6 ${isKidsFrozen ? 'text-lg' : 'text-sm'}`}>
              {tLang('exitMessage', frozenLang)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`flex-1 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all ${isKidsFrozen ? 'py-4 text-lg' : 'py-3 text-base'}`}
              >
                {tLang('exitCancel', frozenLang)}
              </button>
              <button
                onClick={handleExitConfirmed}
                className={`flex-1 rounded-xl font-bold text-white bg-red-400 hover:bg-red-500 transition-all ${isKidsFrozen ? 'py-4 text-lg' : 'py-3 text-base'}`}
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

// src/modules/_shared/TypeAnswerMultiBase.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 10: TypeAnswer variant for "find-country" directions where multiple
// answers are valid (e.g. "name any country that uses the Euro").
//
// Differences from TypeAnswerBase:
//   - question.acceptedAnswers is a Set<string> of normalised valid answers
//   - question.correctAnswer   is the canonical answer shown in feedback
//   - question.otherValidCount is shown in the "also valid" note
//   - Matching: check typed (normalised) against acceptedAnswers Set
//     still supports fuzzy close match against correctAnswer for "Almost!"
//   - Feedback: on correct, if otherValidCount > 0 shows "✓ Also: Germany, etc."
//
// CONFIG shape identical to TypeAnswerBase, plus getQuestion must return:
//   { correctAnswer, acceptedAnswers, otherValidCount, stimulusLabel, stimulus }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }  from 'react'
import { useLocation, useNavigate }     from 'react-router-dom'
import { useLanguage }                  from '../../context/LanguageContext'
import { useAgeMode }                   from '../../context/AgeModeContext'
import { useSettings }                  from '../../context/SettingsContext'
import { usePlayer }                    from '../../context/PlayerContext'
import { usePlayerProgress }            from '../../hooks/usePlayerProgress'
import { matchAnswer }                  from '../../utils/fuzzyMatch'
import { getAccent }                    from '../../screens/PlayerSelectScreen'

// Normalise mirrors fuzzyMatch.js
function norm(str) {
  if (!str) return ''
  return str.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

const ACCENT = {
  amber:  { border: 'border-amber-400',  ring: 'ring-amber-300',  progress: 'bg-amber-500',  submit: 'bg-amber-500 hover:bg-amber-600' },
  blue:   { border: 'border-blue-400',   ring: 'ring-blue-300',   progress: 'bg-blue-500',   submit: 'bg-blue-500 hover:bg-blue-600'   },
  green:  { border: 'border-green-400',  ring: 'ring-green-300',  progress: 'bg-green-500',  submit: 'bg-green-500 hover:bg-green-600' },
  indigo: { border: 'border-indigo-400', ring: 'ring-indigo-300', progress: 'bg-indigo-500', submit: 'bg-indigo-500 hover:bg-indigo-600'},
}

export default function TypeAnswerMultiBase({ countries, config }) {
  const {
    moduleId, direction, accentColor,
    generateFn, getQuestion,
  } = config

  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }              = useLanguage()
  const { ageMode: liveAgeMode }               = useAgeMode()
  const { questionsPerRound }                  = useSettings()
  const { activePlayer }                       = usePlayer()
  const { getProgress, recordRound }           = usePlayerProgress(moduleId)

  const frozenLang         = location.state?.lang         ?? liveLang
  const frozenAgeMode      = location.state?.ageMode      ?? liveAgeMode
  const frozenRegionFilter = location.state?.regionFilter ?? 'all'
  const isKidsFrozen       = frozenAgeMode === 'kids'
  const maxHints           = isKidsFrozen ? 3 : 1
  const accent             = ACCENT[accentColor] ?? ACCENT.blue
  const accentPlayer       = getAccent(activePlayer?.accentColor)
  // Safe submit colour: prefer player accent, fall back to module accent colour
  const submitClass        = accentPlayer?.submit || accent.submit

  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [typed, setTyped]                     = useState('')
  const [result, setResult]                   = useState(null)   // null | 'correct' | 'close' | 'wrong'
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
      setQuestions(generateFn(
        countries, frozenLang, frozenAgeMode, questionsPerRound,
        progress, 0, frozenRegionFilter,
      ))
    }
  }, [countries]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (result === null && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [current, result])

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        {tLang('loading', frozenLang) || 'Loading…'}
      </div>
    )
  }

  const question    = questions[current]
  const isAnswered  = result !== null
  const isLastQ     = current === questions.length - 1
  const progressPct = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100

  const {
    correctAnswer,
    acceptedAnswers,   // Set<string> of normalised valid answers
    otherValidCount,   // number — how many OTHER valid answers exist
    stimulusLabel,
    stimulus,
  } = getQuestion(question, frozenLang)

  const canHint = !isAnswered && hintsUsed < maxHints

  // Hint: reveal first N chars; preserve word boundaries as visible gaps
  // Build an array of word-strings so spaces render as real gaps between spans
  const hintWords = correctAnswer.split(' ').reduce((acc, word, wi, arr) => {
    let charOffset = arr.slice(0, wi).join(' ').length + (wi > 0 ? 1 : 0)
    const wordStr = word.split('').map((ch, ci) =>
      charOffset + ci < hintsUsed ? ch : '_'
    ).join(' ') // thin space between letters
    acc.push(wordStr)
    return acc
  }, [])

  function handleHint() {
    if (!canHint) return
    setHintsUsed(h => h + 1)
  }

  function handleSubmit() {
    if (isAnswered || !typed.trim()) return

    const normTyped = norm(typed)

    // Check against the full set of accepted answers first
    if (acceptedAnswers && acceptedAnswers.has(normTyped)) {
      setResult('correct')
      setScore(s  => s + 1)
      setStreak(s => s + 1)
      setAnswers(a => [...a, { question, correct: true, match: 'correct', chosen: typed }])
      return
    }

    // Fall back to fuzzy close against canonical correctAnswer
    const { match } = matchAnswer(typed, correctAnswer)
    const isCorrect = false   // fuzzy match = "almost" but not counted correct
    setResult(match === 'correct' ? 'correct' : match)
    setStreak(0)
    setAnswers(a => [...a, { question, correct: false, match, chosen: typed }])
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
          mode:      'type-answer',
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

  const feedbackBg   = result === 'correct' ? 'bg-green-50 border-green-200'
                     : result === 'close'   ? 'bg-amber-50 border-amber-200'
                     :                        'bg-red-50 border-red-200'
  const feedbackText = result === 'correct' ? 'text-green-700'
                     : result === 'close'   ? 'text-amber-700'
                     :                        'text-red-600'

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">

      {/* ── Header bar ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className={`text-gray-400 hover:text-gray-600 font-semibold transition-colors ${isKidsFrozen ? 'text-base' : 'text-sm'}`}
          >
            ✕ {tLang('exitButtonLabel', frozenLang) || 'Exit'}
          </button>
          <span className={`text-gray-500 font-semibold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {tLang('quizScore', frozenLang) || 'Score'}: {score}
            {streak >= 2 && <span className="ml-2 text-orange-500">🔥 {streak}</span>}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`${accentPlayer?.progress || accent.progress} h-1.5 rounded-full transition-all duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang) || 'Q'} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 pb-6 max-w-lg mx-auto w-full gap-4">

        {/* Stimulus */}
        <div className="w-full flex justify-center">
          {stimulus}
        </div>

        {/* Hint display */}
        {hintsUsed > 0 && !isAnswered && (
          <p className={`text-center font-mono text-gray-500 ${isKidsFrozen ? 'text-2xl' : 'text-xl'}`}>
            {hintWords.map((w, i) => (
              <span key={i} className="inline-block mx-2">{w}</span>
            ))}
          </p>
        )}

        {/* Input */}
        {!isAnswered && (
          <div className="w-full flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tLang('typeAnswerPlaceholder', frozenLang) || 'Type your answer…'}
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
                {tLang('typeAnswerSubmit', frozenLang) || 'Submit'} ✓
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
              {result === 'correct'
                ? tLang('quizCorrect', frozenLang)
                : result === 'close'
                  ? (tLang('typeAnswerClose', frozenLang) || 'Almost!')
                  : tLang('quizWrong', frozenLang)}
            </p>

            {/* Show canonical answer if wrong/close */}
            {result !== 'correct' && (
              <p className={`font-semibold ${feedbackText} ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
                {tLang('quizCorrectAnswer', frozenLang) || 'Correct answer'}:{' '}
                <strong>{correctAnswer}</strong>
              </p>
            )}

            {/* Educational note: also valid answers */}
            {result === 'correct' && otherValidCount > 0 && (
              <p className={`mt-1 font-medium text-green-600 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
                {tLang('alsoValidAnswers', frozenLang)
                  ? tLang('alsoValidAnswers', frozenLang).replace('{n}', otherValidCount)
                  : `Also correct: ${otherValidCount} other ${otherValidCount === 1 ? 'country' : 'countries'}`}
              </p>
            )}
          </div>
        )}

        {isAnswered && (
          <button
            onClick={handleNext}
            className={`
              w-full rounded-2xl font-extrabold text-white transition-all active:scale-95
              ${submitClass}
              ${isKidsFrozen ? 'py-5 text-xl' : 'py-4 text-base'}
            `}
          >
            {isLastQ
              ? (tLang('finish', frozenLang) || 'Finish')
              : (tLang('next', frozenLang) || 'Next')} →
          </button>
        )}
      </div>

      {/* ── Exit confirm ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className={`font-extrabold text-gray-800 mb-2 ${isKidsFrozen ? 'text-xl' : 'text-lg'}`}>
              {tLang('exitTitle', frozenLang) || 'Leave quiz?'}
            </p>
            <p className={`text-gray-500 mb-6 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {tLang('exitMessage', frozenLang) || 'Your progress will be lost.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`flex-1 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-300 transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
              >
                {tLang('exitCancel', frozenLang) || 'Keep playing'}
              </button>
              <button
                onClick={() => navigate('/')}
                className={`flex-1 rounded-2xl bg-red-500 font-bold text-white transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
              >
                {tLang('exitConfirm', frozenLang) || 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

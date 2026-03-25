// src/modules/_shared/FlashcardMultiBase.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 10: Flashcard variant for "find-country" directions where multiple
// answers are valid (e.g. currency → country, region → country).
//
// Differences from FlashcardBase:
//   - getBack() receives question.otherValidCount and shows an educational note:
//     "🌍 Also used by 18 other countries" or "🌍 + 47 other countries in this region"
//   - Self-evaluation (Got it / Missed it) same as standard FlashcardBase
//
// CONFIG shape:
// {
//   moduleId, direction, accentColor,
//   generateFn,
//   getFront(question, lang) → ReactNode,
//   getBack(question, lang)  → ReactNode,
//   getOtherNote(question, lang) → string|null  — optional extra note on back
// }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }  from 'react'
import { useLocation, useNavigate }     from 'react-router-dom'
import { useLanguage }                  from '../../context/LanguageContext'
import { useAgeMode }                   from '../../context/AgeModeContext'
import { useSettings }                  from '../../context/SettingsContext'
import { usePlayer }                    from '../../context/PlayerContext'
import { usePlayerProgress }            from '../../hooks/usePlayerProgress'
import { getAccent }                    from '../../screens/PlayerSelectScreen'

export default function FlashcardMultiBase({ countries, config }) {
  const {
    moduleId, direction, accentColor,
    generateFn, getFront, getBack,
  } = config

  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }              = useLanguage()
  const { ageMode: liveAgeMode, isKids }       = useAgeMode()
  const { questionsPerRound }                  = useSettings()
  const { activePlayer }                       = usePlayer()
  const { getProgress, recordRound }           = usePlayerProgress(moduleId)

  const frozenLang         = location.state?.lang         ?? liveLang
  const frozenAgeMode      = location.state?.ageMode      ?? liveAgeMode
  const frozenRegionFilter = location.state?.regionFilter ?? 'all'
  const isKidsFrozen       = frozenAgeMode === 'kids'
  const accent             = getAccent(activePlayer?.accentColor)

  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [flipped, setFlipped]                 = useState(false)
  const [score, setScore]                     = useState(0)
  const [answers, setAnswers]                 = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const generated = useRef(false)

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

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        {tLang('loading', frozenLang) || 'Loading…'}
      </div>
    )
  }

  const question    = questions[current]
  const isLastQ     = current === questions.length - 1
  const progressPct = ((current + (flipped ? 1 : 0)) / questions.length) * 100

  function handleFlip() {
    setFlipped(true)
  }

  function handleSelfEval(gotIt) {
    if (!flipped) return
    if (gotIt) setScore(s => s + 1)
    setAnswers(a => [...a, {
      question: {
        country:       question.country,
        correctAnswer: question.correctAnswer,
      },
      correct: gotIt,
      match:   gotIt ? 'correct' : 'wrong',
      chosen:  gotIt ? question.correctAnswer : '',
    }])

    if (isLastQ) {
      const mistakes = [...answers, { correct: gotIt }]
        .filter(a => !a.correct)
        .map(a => a.question?.country?.code)
        .filter(Boolean)
      const finalScore = gotIt ? score + 1 : score
      recordRound(
        [...answers, {
          question: { country: question.country, correctAnswer: question.correctAnswer },
          correct:  gotIt, match: gotIt ? 'correct' : 'wrong', chosen: question.correctAnswer,
        }],
        finalScore,
        questions.length,
        'flashcard',
        direction,
        mistakes,
      )
      navigate('/results', {
        state: {
          score:     finalScore,
          total:     questions.length,
          answers:   [...answers, {
            question: { country: question.country, correctAnswer: question.correctAnswer },
            correct:  gotIt, match: gotIt ? 'correct' : 'wrong',
          }],
          moduleId,
          direction,
          mode:      'flashcard',
          lang:      frozenLang,
          ageMode:   frozenAgeMode,
          mistakes,
        },
      })
    } else {
      setCurrent(c => c + 1)
      setFlipped(false)
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className={`text-gray-400 hover:text-gray-600 font-semibold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}
          >
            ✕ {tLang('exitButtonLabel', frozenLang) || 'Exit'}
          </button>
          <span className={`font-semibold text-gray-500 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {tLang('quizScore', frozenLang) || 'Score'}: {score}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`${accent.progress} h-1.5 rounded-full transition-all duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Card ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 max-w-lg mx-auto w-full gap-4">

        <div className={`
          w-full rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col items-center justify-center
          min-h-[220px] bg-white gap-4 transition-all duration-300
        `}>
          {!flipped
            ? getFront(question, frozenLang, isKidsFrozen)
            : getBack(question, frozenLang, isKidsFrozen)
          }
        </div>

        {/* Flip button */}
        {!flipped && (
          <button
            onClick={handleFlip}
            className={`
              w-full rounded-2xl font-extrabold text-white transition-all active:scale-95
              ${accent.submit}
              ${isKidsFrozen ? 'py-5 text-xl' : 'py-4 text-base'}
            `}
          >
            {tLang('flashcardReveal', frozenLang) || 'Reveal'} 👁️
          </button>
        )}

        {/* Self-eval buttons */}
        {flipped && (
          <div className="w-full flex gap-3">
            <button
              onClick={() => handleSelfEval(false)}
              className={`
                flex-1 rounded-2xl border-2 border-red-200 bg-red-50 font-extrabold text-red-600
                hover:bg-red-100 transition-all active:scale-95
                ${isKidsFrozen ? 'py-5 text-xl' : 'py-4 text-base'}
              `}
            >
              {tLang('flashcardMissed', frozenLang) || 'Missed it'} ✗
            </button>
            <button
              onClick={() => handleSelfEval(true)}
              className={`
                flex-1 rounded-2xl border-2 border-green-200 bg-green-50 font-extrabold text-green-600
                hover:bg-green-100 transition-all active:scale-95
                ${isKidsFrozen ? 'py-5 text-xl' : 'py-4 text-base'}
              `}
            >
              {tLang('flashcardGotIt', frozenLang) || 'Got it'} ✓
            </button>
          </div>
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
              {tLang('exitMessage', frozenLang) || 'Progress will be lost.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`flex-1 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
              >
                {tLang('exitCancel', frozenLang) || 'Keep playing'}
              </button>
              <button
                onClick={() => navigate('/')}
                className={`flex-1 rounded-2xl bg-red-500 font-bold text-white ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}
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

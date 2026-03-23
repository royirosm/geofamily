// src/modules/_shared/FlashcardBase.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared base component for all Flashcard quiz modes.
// Each direction is a thin wrapper passing its specific config.
//
// Config shape:
//   moduleId    string   — e.g. 'capitals'
//   direction   string   — e.g. 'find-capital'
//   accentColor string   — tailwind color key: 'blue' | 'indigo' | 'rose' | 'pink'
//   generateFn  function — (countries, lang, ageMode, count, progress) => questions[]
//   getFront    function — (question, lang) => JSX  ← question side of card
//   getBack     function — (question, lang) => JSX  ← answer side of card
//
// Flow per card:
//   1. Front shown  — player reads the question
//   2. Tap card     — flips to reveal answer (CSS 3D flip animation)
//   3. Self-rate    — "Got it ✓" or "Not yet ✗" buttons appear
//   4. Next card
//
// Scoring:
//   "Got it"  → correct: true  → SRS correct++
//   "Not yet" → correct: false → SRS wrong++
//   Accuracy in history = self-rated correct / total
//
// All hooks are called before any early return (Rules of Hooks compliant).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate }    from 'react-router-dom'
import { useLanguage }                 from '../../context/LanguageContext'
import { useAgeMode }                  from '../../context/AgeModeContext'
import { useSettings }                 from '../../context/SettingsContext'
import { usePlayerProgress }           from '../../hooks/usePlayerProgress'

const MODE = 'flashcard'

// Tailwind accent map
const ACCENT = {
  blue:   { progress: 'bg-blue-500',   got: 'bg-green-500 hover:bg-green-600',   notYet: 'bg-red-400 hover:bg-red-500',   flip: 'bg-blue-500 hover:bg-blue-600'   },
  indigo: { progress: 'bg-indigo-500', got: 'bg-green-500 hover:bg-green-600',   notYet: 'bg-red-400 hover:bg-red-500',   flip: 'bg-indigo-500 hover:bg-indigo-600' },
  rose:   { progress: 'bg-rose-500',   got: 'bg-green-500 hover:bg-green-600',   notYet: 'bg-red-400 hover:bg-red-500',   flip: 'bg-rose-500 hover:bg-rose-600'   },
  pink:   { progress: 'bg-pink-500',   got: 'bg-green-500 hover:bg-green-600',   notYet: 'bg-red-400 hover:bg-red-500',   flip: 'bg-pink-500 hover:bg-pink-600'   },
}

export default function FlashcardBase({ countries, config }) {
  const { moduleId, direction, accentColor = 'blue', generateFn, getFront, getBack } = config

  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
  const { questionsPerRound }      = useSettings()
  const { getProgress }            = usePlayerProgress(moduleId)

  const frozenLang    = location.state?.lang    ?? liveLang
  const frozenAgeMode = location.state?.ageMode ?? liveAgeMode
  const isKidsFrozen  = frozenAgeMode === 'kids'
  const accent        = ACCENT[accentColor] ?? ACCENT.blue

  // ── All state hooks — must be before any early return ──────────────────────
  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [flipped, setFlipped]                 = useState(false)
  const [rated, setRated]                     = useState(false)    // true after Got it / Not yet
  const [score, setScore]                     = useState(0)        // self-rated "got it" count
  const [answers, setAnswers]                 = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  // transitioning: true while card is flipping back between questions.
  // Freezes card content so the next question's back never flickers through.
  const [transitioning, setTransitioning]     = useState(false)

  const generated = useRef(false)

  // ── Generate questions (hook — before early return) ────────────────────────
  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      const progress = getProgress()
      setQuestions(generateFn(countries, frozenLang, frozenAgeMode, questionsPerRound, progress))
    }
  }, [countries, frozenLang, frozenAgeMode, questionsPerRound, getProgress, generateFn])

  // ── Loading state (after all hooks) ───────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        {tLang('loading', frozenLang)}
      </div>
    )
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const question    = questions[current]
  const isLastQ     = current === questions.length - 1
  const progressPct = ((current + (rated ? 1 : 0)) / questions.length) * 100
  const front       = getFront(question, frozenLang)
  const back        = getBack(question, frozenLang)

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleFlip() {
    if (!rated) setFlipped(f => !f)
  }

  function handleRate(gotIt) {
    if (rated) return
    setRated(true)
    if (gotIt) setScore(s => s + 1)
    setAnswers(prev => [...prev, {
      question,
      correct: gotIt,
      // match field mimics type-answer shape for ResultsScreen compatibility
      match: gotIt ? 'correct' : 'wrong',
    }])
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
      // Step 1: flip the card back to front face
      setFlipped(false)
      setTransitioning(true)
      // Step 2: after the 500ms CSS transition completes, advance to next question.
      // This prevents the next question's back content from flickering through
      // while the card is mid-rotation.
      setTimeout(() => {
        setCurrent(c => c + 1)
        setRated(false)
        setTransitioning(false)
      }, 520) // 20ms buffer over the 500ms CSS transition
    }
  }

  function handleExitConfirmed() {
    navigate(`/module/${moduleId}`, { state: { lang: frozenLang, ageMode: frozenAgeMode } })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
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
          <span className={`font-bold ${isKidsFrozen ? 'text-base' : 'text-sm'} text-gray-600`}>
            {tLang('flashcardProgress', frozenLang)}: {current + 1}/{questions.length}
            {score > 0 && <span className="ml-2 text-green-600">✓ {score}</span>}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${accent.progress}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 max-w-lg mx-auto w-full gap-5">

        {/* ── Flashcard ─────────────────────────────────────────── */}
        {/* CSS 3D flip — perspective on wrapper, rotateY on inner */}
        <div
          className="w-full cursor-pointer select-none"
          style={{ perspective: '1000px' }}
          onClick={handleFlip}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: isKidsFrozen ? '280px' : '240px',
            }}
          >
            {/* ── Front face ── */}
            <div
              className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-6 gap-4"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {front}
              {/* Tap hint — disappears after first flip */}
              {!flipped && (
                <p className={`text-gray-300 font-medium mt-2 ${isKidsFrozen ? 'text-base' : 'text-xs'}`}>
                  {tLang('flashcardTapToReveal', frozenLang)}
                </p>
              )}
            </div>

            {/* ── Back face ── */}
            <div
              className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-6 gap-4"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Answer label */}
              <p className={`text-gray-400 font-semibold uppercase tracking-widest ${isKidsFrozen ? 'text-sm' : 'text-xs'}`}>
                {tLang('flashcardAnswer', frozenLang)}
              </p>
              {/* Freeze content during flip-back transition — prevents the next
                  question's answer from flickering through while card rotates */}
              {!transitioning && back}
            </div>
          </div>
        </div>

        {/* ── Self-rating buttons (appear after flip) ───────────── */}
        {flipped && !rated && (
          <div className="w-full flex gap-3">
            <button
              onClick={() => handleRate(false)}
              className={`
                flex-1 rounded-2xl font-extrabold text-white transition-all active:scale-95 shadow-md
                ${isKidsFrozen ? 'py-4 text-lg' : 'py-3 text-base'}
                ${accent.notYet}
              `}
            >
              ✗ {tLang('flashcardNotYet', frozenLang)}
            </button>
            <button
              onClick={() => handleRate(true)}
              className={`
                flex-1 rounded-2xl font-extrabold text-white transition-all active:scale-95 shadow-md
                ${isKidsFrozen ? 'py-4 text-lg' : 'py-3 text-base'}
                ${accent.got}
              `}
            >
              ✓ {tLang('flashcardGotIt', frozenLang)}
            </button>
          </div>
        )}

        {/* ── Rating feedback + Next (appear after rating) ──────── */}
        {rated && (
          <div className="w-full flex items-center gap-3">
            <div className={`
              flex items-center gap-2 flex-1 px-4 py-3 rounded-2xl font-bold
              ${answers[answers.length - 1]?.correct
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
              }
              ${isKidsFrozen ? 'text-base' : 'text-sm'}
            `}>
              <span className="text-xl">
                {answers[answers.length - 1]?.correct ? '✓' : '✗'}
              </span>
              <span>
                {answers[answers.length - 1]?.correct
                  ? tLang('flashcardMarkedGot', frozenLang)
                  : tLang('flashcardMarkedNotYet', frozenLang)
                }
              </span>
            </div>
            <button
              onClick={handleNext}
              className={`
                rounded-2xl font-extrabold text-white flex-shrink-0 transition-all active:scale-95 shadow-md
                ${isKidsFrozen ? 'px-6 py-4 text-base' : 'px-5 py-3 text-sm'}
                ${accent.flip}
              `}
            >
              {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
            </button>
          </div>
        )}

        {/* ── Flip prompt when not yet flipped ─────────────────── */}
        {!flipped && !rated && (
          <button
            onClick={handleFlip}
            className={`
              w-full rounded-2xl font-extrabold text-white transition-all active:scale-95 shadow-md
              ${isKidsFrozen ? 'py-4 text-xl' : 'py-3 text-base'}
              ${accent.flip}
            `}
          >
            {tLang('flashcardReveal', frozenLang)} ↓
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

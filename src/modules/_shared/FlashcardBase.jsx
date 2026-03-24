// src/modules/_shared/FlashcardBase.jsx
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

const MODE = 'flashcard'

const ACCENT = {
  blue:   { progress: 'bg-blue-500',   got: 'bg-green-500 hover:bg-green-600', notYet: 'bg-red-400 hover:bg-red-500', flip: 'bg-blue-500 hover:bg-blue-600'     },
  indigo: { progress: 'bg-indigo-500', got: 'bg-green-500 hover:bg-green-600', notYet: 'bg-red-400 hover:bg-red-500', flip: 'bg-indigo-500 hover:bg-indigo-600' },
  rose:   { progress: 'bg-rose-500',   got: 'bg-green-500 hover:bg-green-600', notYet: 'bg-red-400 hover:bg-red-500', flip: 'bg-rose-500 hover:bg-rose-600'     },
  pink:   { progress: 'bg-pink-500',   got: 'bg-green-500 hover:bg-green-600', notYet: 'bg-red-400 hover:bg-red-500', flip: 'bg-pink-500 hover:bg-pink-600'     },
}

export default function FlashcardBase({ countries, config }) {
  const { moduleId, direction, accentColor = 'blue', generateFn, getFront, getBack } = config

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
  const accent             = ACCENT[accentColor] ?? ACCENT.blue

  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [flipped, setFlipped]                 = useState(false)
  const [rated, setRated]                     = useState(false)
  const [score, setScore]                     = useState(0)
  const [answers, setAnswers]                 = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [transitioning, setTransitioning]     = useState(false)

  const generated = useRef(false)

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

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        {tLang('loading', frozenLang)}
      </div>
    )
  }

  const question    = questions[current]
  const isLastQ     = current === questions.length - 1
  const progressPct = ((current + (rated ? 1 : 0)) / questions.length) * 100
  const front       = getFront(question, frozenLang)
  const back        = getBack(question, frozenLang)

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
      match:   gotIt ? 'correct' : 'wrong',
      chosen:  gotIt ? question.correctAnswer : '',
    }])
  }

  function handleNext() {
    setTransitioning(true)
    setTimeout(() => {
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
        setFlipped(false)
        setRated(false)
        setTransitioning(false)
      }
    }, 300)
  }

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
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6 max-w-lg mx-auto w-full gap-5">

        {/* Card */}
        <div
          onClick={handleFlip}
          className={`
            w-full cursor-pointer select-none
            transition-all duration-300
            ${flipped ? '' : 'hover:scale-[1.01] active:scale-[0.99]'}
          `}
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full"
            style={{
              transformStyle: 'preserve-3d',
              transition:     'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
              transform:      flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight:      isKidsFrozen ? '260px' : '220px',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center p-6"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {!transitioning ? front : null}
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center p-6"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {!transitioning ? back : null}
            </div>
          </div>
        </div>

        {/* Flip hint (before flip) */}
        {!flipped && !rated && (
          <p className={`text-gray-400 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {tLang('flashcardTapToReveal', frozenLang) ?? 'Tap to reveal'}
          </p>
        )}

        {/* Self-rate buttons (after flip, before rating) */}
        {flipped && !rated && (
          <div className="w-full flex gap-3">
            <button
              onClick={() => handleRate(false)}
              className={`flex-1 rounded-2xl font-extrabold text-white transition-all active:scale-95 ${accent.notYet} ${isKidsFrozen ? 'py-4 text-lg' : 'py-3 text-base'}`}
            >
              ✗ {tLang('flashcardNotYet', frozenLang) ?? 'Not yet'}
            </button>
            <button
              onClick={() => handleRate(true)}
              className={`flex-1 rounded-2xl font-extrabold text-white transition-all active:scale-95 ${accent.got} ${isKidsFrozen ? 'py-4 text-lg' : 'py-3 text-base'}`}
            >
              ✓ {tLang('flashcardGotIt', frozenLang) ?? 'Got it'}
            </button>
          </div>
        )}

        {/* Next button (after rating) */}
        {rated && (
          <button
            onClick={handleNext}
            className={`
              w-full rounded-2xl font-extrabold text-white transition-all active:scale-95
              ${accent.flip}
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

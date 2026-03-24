// src/modules/sovereignty/country-or-territory/SovereigntyBinary.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sovereignty › Country or Territory? — unique binary mechanic
//
// Shows: flag + name of a place
// Player taps one of two large buttons: 🌍 Country  /  🗺️ Territory
//
// Answer shape matches the convention used by all other quiz components:
//   { question: { country, correctAnswer }, correct, match }
// This makes ResultsScreen and recordRound work without any special-casing.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }   from 'react'
import { useLocation, useNavigate }      from 'react-router-dom'
import { useLanguage }                   from '../../../context/LanguageContext'
import { useAgeMode }                    from '../../../context/AgeModeContext'
import { useSettings }                   from '../../../context/SettingsContext'
import { usePlayerProgress }             from '../../../hooks/usePlayerProgress'
import { generateSovereigntyBinaryQuestions } from '../../../utils/questionGenerator'
import FlagImage                         from '../../../components/FlagImage'
import TerritoryBadge                    from '../../../components/TerritoryBadge'

const MODULE_ID = 'sovereignty'
const MODE      = 'multiple-choice'
const DIRECTION = 'country-or-territory'

const ACCENT = {
  bg:       'from-amber-400 to-orange-500',
  progress: 'bg-amber-400',
}

export default function SovereigntyBinary({ countries }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
  const { questionsPerRound }      = useSettings()
  const { getProgress, recordRound } = usePlayerProgress(MODULE_ID)

  const frozenLang    = location.state?.lang    ?? liveLang
  const frozenAgeMode = location.state?.ageMode ?? liveAgeMode
  const isKidsFrozen  = frozenAgeMode === 'kids'

  const [questions, setQuestions]         = useState([])
  const [current, setCurrent]             = useState(0)
  const [result, setResult]               = useState(null)   // null | 'correct' | 'wrong'
  const [score, setScore]                 = useState(0)
  const [answers, setAnswers]             = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const generated = useRef(false)

  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      const progress = getProgress()
      setQuestions(
        generateSovereigntyBinaryQuestions(
          countries, frozenLang, frozenAgeMode, questionsPerRound, progress
        )
      )
    }
  }, [countries, frozenLang, frozenAgeMode, questionsPerRound, getProgress])

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

  // The correct label depends on what the place actually is
  const correctLabel = question.country.independent
    ? tLang('sovCountry', frozenLang)
    : tLang('sovTerritory', frozenLang)

  function handleAnswer(guessedIndependent) {
    if (isAnswered) return
    const isCorrect = guessedIndependent === question.country.independent
    setResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setScore(s => s + 1)

    const yourLabel = guessedIndependent
      ? tLang('sovCountry', frozenLang)
      : tLang('sovTerritory', frozenLang)

    // answer shape matches convention: { question: { country, correctAnswer }, correct, match }
    setAnswers(prev => [...prev, {
      question: {
        country:       question.country,
        correctAnswer: correctLabel,
      },
      correct: isCorrect,
      match:   isCorrect ? 'correct' : 'wrong',
      chosen:  yourLabel,
    }])
  }

  function handleNext() {
    if (isLastQ) {
      const mistakes = answers
        .filter(a => !a.correct)
        .map(a => a.question.country.code)
      recordRound(answers, score, answers.length, MODE, DIRECTION, mistakes)
      navigate('/results', {
        state: {
          score,
          total:     questions.length,
          answers,
          moduleId:  MODULE_ID,
          direction: DIRECTION,
          mode:      MODE,
          lang:      frozenLang,
          ageMode:   frozenAgeMode,
          mistakes,
        },
      })
    } else {
      setCurrent(c => c + 1)
      setResult(null)
    }
  }

  const feedbackBg = result === 'correct'
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-red-50 border-red-200 text-red-700'

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-amber-50">

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          {/* Back button — goes to module select, not home */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-sm font-semibold transition-colors"
          >
            <span className="text-xs">✕</span>
            {tLang('exitButtonLabel', frozenLang)}
          </button>
          <span className={`font-bold text-amber-600 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {tLang('quizScore', frozenLang)}: {score}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${ACCENT.progress}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Question card ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5 max-w-lg mx-auto w-full">

        <FlagImage
          src={question.country.flag}
          alt={question.country.name[frozenLang]}
          className={`rounded-2xl shadow-lg object-cover ${isKidsFrozen ? 'w-52 h-36' : 'w-44 h-30'}`}
          isKids={isKidsFrozen}
        />

        <div className="text-center">
          <p className={`font-extrabold text-gray-800 ${isKidsFrozen ? 'text-3xl' : 'text-2xl'}`}>
            {question.country.name[frozenLang] ?? question.country.name.en}
          </p>
          <p className={`text-gray-400 mt-1 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {question.country.capital[frozenLang] ?? question.country.capital.en}
          </p>
        </div>

        {/* Two big answer buttons */}
        {!isAnswered && (
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={() => handleAnswer(true)}
              className={`
                flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-gray-200
                bg-white hover:border-blue-400 hover:shadow-lg active:scale-95
                transition-all duration-150 font-extrabold text-gray-700
                ${isKidsFrozen ? 'py-8 text-xl' : 'py-6 text-base'}
              `}
            >
              <span className={isKidsFrozen ? 'text-5xl' : 'text-4xl'}>🌍</span>
              <span>{tLang('sovCountry', frozenLang)}</span>
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`
                flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-gray-200
                bg-white hover:border-amber-400 hover:shadow-lg active:scale-95
                transition-all duration-150 font-extrabold text-gray-700
                ${isKidsFrozen ? 'py-8 text-xl' : 'py-6 text-base'}
              `}
            >
              <span className={isKidsFrozen ? 'text-5xl' : 'text-4xl'}>🗺️</span>
              <span>{tLang('sovTerritory', frozenLang)}</span>
            </button>
          </div>
        )}

        {/* Feedback */}
        {isAnswered && (
          <div className={`w-full rounded-2xl border p-4 ${feedbackBg}`}>
            <p className={`font-extrabold mb-1 ${isKidsFrozen ? 'text-xl' : 'text-base'}`}>
              {result === 'correct'
                ? tLang('quizCorrect', frozenLang)
                : tLang('quizWrong', frozenLang)}
            </p>
            {result === 'wrong' && (
              <p className={`font-semibold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
                {tLang('sovCorrectAnswer', frozenLang)}:{' '}
                <span className="font-extrabold">
                  {question.country.independent ? `🌍 ${tLang('sovCountry', frozenLang)}` : `🗺️ ${tLang('sovTerritory', frozenLang)}`}
                </span>
              </p>
            )}
            {/* Always show sovereign badge for territories after answering */}
            {!question.country.independent && question.country.sovereign && (
              <div className="mt-2">
                <TerritoryBadge sovereign={question.country.sovereign} lang={frozenLang} isKids={isKidsFrozen} />
              </div>
            )}
          </div>
        )}

        {isAnswered && (
          <button
            onClick={handleNext}
            className={`
              w-full rounded-2xl font-extrabold text-white
              bg-gradient-to-r ${ACCENT.bg} shadow-lg active:scale-95 transition-all
              ${isKidsFrozen ? 'py-5 text-xl' : 'py-4 text-base'}
            `}
          >
            {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
          </button>
        )}
      </div>

      {/* ── Exit confirm ─────────────────────────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className={`font-extrabold text-gray-800 mb-2 ${isKidsFrozen ? 'text-xl' : 'text-lg'}`}>
              {tLang('exitTitle', frozenLang)}
            </p>
            <p className="text-gray-500 text-sm mb-5">{tLang('exitMessage', frozenLang)}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {tLang('exitCancel', frozenLang)}
              </button>
              <button
                onClick={() => navigate(`/module/${MODULE_ID}`, { state: { lang: frozenLang, ageMode: frozenAgeMode } })}
                className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
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

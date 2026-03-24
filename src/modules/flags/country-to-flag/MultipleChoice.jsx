// src/modules/flags/country-to-flag/MultipleChoice.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8B: TerritoryBadge added below country name in question stimulus
// Phase 8C: regionFilter read from route state, passed to generateCountryToFlagQuestions
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }       from 'react'
import { useLocation, useNavigate }          from 'react-router-dom'
import { useLanguage }                       from '../../../context/LanguageContext'
import { useAgeMode }                        from '../../../context/AgeModeContext'
import { useSettings }                       from '../../../context/SettingsContext'
import { usePlayerProgress }                 from '../../../hooks/usePlayerProgress'
import { generateCountryToFlagQuestions }    from '../../../utils/questionGenerator'
import FlagImage                             from '../../../components/FlagImage'
import TerritoryBadge                        from '../../../components/TerritoryBadge'

const MODULE_ID = 'flags'
const MODE      = 'multiple-choice'
const DIRECTION = 'country-to-flag'

export default function MultipleChoice({ countries }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
  const { questionsPerRound }      = useSettings()
  const { getProgress }            = usePlayerProgress(MODULE_ID)

  const frozenLang         = location.state?.lang         ?? liveLang
  const frozenAgeMode      = location.state?.ageMode      ?? liveAgeMode
  const frozenRegionFilter = location.state?.regionFilter ?? 'all'
  const isKidsFrozen       = frozenAgeMode === 'kids'

  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [selected, setSelected]               = useState(null)
  const [score, setScore]                     = useState(0)
  const [streak, setStreak]                   = useState(0)
  const [answers, setAnswers]                 = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const generated = useRef(false)

  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      const progress = getProgress()
      setQuestions(generateCountryToFlagQuestions(
        countries, frozenLang, frozenAgeMode, questionsPerRound,
        progress, 0, frozenRegionFilter,
      ))
    }
  }, [countries, frozenLang, frozenAgeMode, questionsPerRound, getProgress, frozenRegionFilter])

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        {tLang('loading', frozenLang)}
      </div>
    )
  }

  const question   = questions[current]
  const isAnswered = selected !== null
  const isLastQ    = current === questions.length - 1

  function handleAnswer(choice) {
    if (isAnswered) return
    setSelected(choice.label)
    const correct = choice.isCorrect
    setScore(s  => correct ? s + 1 : s)
    setStreak(s => correct ? s + 1 : 0)
    setAnswers(a => [...a, { question, correct, chosen: choice.label, match: choice.label }])
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
          moduleId:  MODULE_ID,
          direction: DIRECTION,
          mode:      MODE,
          mistakes:  answers.filter(a => !a.correct).map(a => a.question.country.code),
        },
      })
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  const progressPct = (current / questions.length) * 100

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-pink-50">

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
          <div className="bg-pink-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-3 max-w-lg mx-auto w-full">

        {/* Country name + territory badge */}
        <div className="text-center mb-5 flex-shrink-0">
          <p className={`text-gray-400 mb-1 ${isKidsFrozen ? 'text-base' : 'text-xs'}`}>
            {tLang('quizCountryToFlag', frozenLang) ?? 'Which flag belongs to'}
          </p>
          <h2 className={`font-extrabold text-gray-800 leading-tight ${isKidsFrozen ? 'text-3xl' : 'text-2xl'}`}>
            {question.country.name[frozenLang] ?? question.country.name.en}
          </h2>
          {/* 8B: territory badge */}
          <TerritoryBadge sovereign={question.country.sovereign} lang={frozenLang} isKids={isKidsFrozen} />
        </div>

        {/* Flag choices — 2-column grid */}
        <div className={`w-full grid grid-cols-2 gap-3 flex-shrink-0`}>
          {question.choices.map((choice, i) => {
            const isSelected  = selected === choice.label
            const showCorrect = isAnswered && choice.isCorrect
            const showWrong   = isAnswered && isSelected && !choice.isCorrect

            let borderClass = 'border-2 border-gray-200 hover:border-pink-300 hover:shadow-md'
            if (showCorrect) borderClass = 'border-4 border-green-500 shadow-green-200 shadow-lg'
            if (showWrong)   borderClass = 'border-4 border-red-400 shadow-red-200 shadow-lg'

            return (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswered}
                className={`
                  relative rounded-2xl overflow-hidden transition-all duration-200
                  ${isKidsFrozen ? 'h-24' : 'h-20'}
                  ${borderClass}
                  ${isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                `}
              >
                <img
                  src={choice.label}
                  alt={choice.countryName}
                  className="w-full h-full object-cover"
                />
                {showCorrect && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
                {showWrong && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✗</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Feedback + next */}
        {isAnswered && (
          <div className="mt-4 w-full flex items-center gap-3 flex-shrink-0">
            <p className={`flex-1 font-bold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {answers[answers.length - 1]?.correct
                ? <span className="text-green-600">{tLang('quizCorrect', frozenLang)}</span>
                : <span className="text-red-500">{tLang('quizWrong', frozenLang)}</span>
              }
            </p>
            <button
              onClick={handleNext}
              className={`rounded-xl font-bold text-white flex-shrink-0 bg-pink-500 hover:bg-pink-600 transition-all active:scale-95 ${isKidsFrozen ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'}`}
            >
              {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
            </button>
          </div>
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
                onClick={() => navigate('/module/' + MODULE_ID)}
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

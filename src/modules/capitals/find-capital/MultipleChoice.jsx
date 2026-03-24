// src/modules/capitals/find-capital/MultipleChoice.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8B: TerritoryBadge added below country name in question stimulus
// Phase 8C: regionFilter read from route state, passed to generateQuestions
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }  from 'react'
import { useLocation, useNavigate }     from 'react-router-dom'
import { useLanguage }                  from '../../../context/LanguageContext'
import { useAgeMode }                   from '../../../context/AgeModeContext'
import { useSettings }                  from '../../../context/SettingsContext'
import { usePlayerProgress }            from '../../../hooks/usePlayerProgress'
import { generateQuestions }            from '../../../utils/questionGenerator'
import FlagImage                        from '../../../components/FlagImage'
import TerritoryBadge                   from '../../../components/TerritoryBadge'

const MODULE_ID = 'capitals'
const MODE      = 'multiple-choice'
const DIRECTION = 'find-capital'

export default function MultipleChoice({ countries }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }        = useLanguage()
  const { ageMode: liveAgeMode, isKids } = useAgeMode()
  const { questionsPerRound }            = useSettings()
  const { getProgress }                  = usePlayerProgress(MODULE_ID)

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
      setQuestions(generateQuestions(
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
    setAnswers(a => [...a, {
      question,
      correct,
      chosen: choice.label,
      match:  choice.label,
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

  const progressPct = ((current) / questions.length) * 100

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
          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-3 max-w-lg mx-auto w-full">

        {/* Flag */}
        <div className={`rounded-2xl overflow-hidden shadow-xl border-4 border-white mb-3 flex-shrink-0 ${isKidsFrozen ? '' : ''}`}>
          <FlagImage
            src={question.country.flag}
            alt={`Flag of ${question.country.name[frozenLang]}`}
            className={isKidsFrozen ? 'w-44 h-28' : 'w-36 h-24'}
            isKids={isKidsFrozen}
          />
        </div>

        {/* Question */}
        <div className="text-center mb-3 flex-shrink-0">
          <p className={`text-gray-500 ${isKidsFrozen ? 'text-base' : 'text-xs'}`}>
            {tLang('quizQuestion', frozenLang)}
          </p>
          <h2 className={`font-extrabold text-gray-800 leading-tight ${isKidsFrozen ? 'text-2xl' : 'text-xl'}`}>
            {question.country.name[frozenLang]}
          </h2>
          {/* 8B: territory badge */}
          <TerritoryBadge sovereign={question.country.sovereign} lang={frozenLang} isKids={isKidsFrozen} />
        </div>

        {/* Choices */}
        <div className="w-full space-y-2 flex-shrink-0">
          {question.choices.map((choice, i) => {
            const isSelected  = selected === choice.label
            const showCorrect = isAnswered && choice.isCorrect
            const showWrong   = isAnswered && isSelected && !choice.isCorrect
            let btnClass = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            if (showCorrect) btnClass = 'bg-green-500 border-2 border-green-500 text-white'
            if (showWrong)   btnClass = 'bg-red-400 border-2 border-red-400 text-white'
            return (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswered}
                className={`w-full rounded-xl px-4 font-semibold transition-all duration-200 ${isKidsFrozen ? 'py-3 text-lg' : 'py-2.5 text-sm'} ${btnClass} ${isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
              >
                {isAnswered && showCorrect && <span className="mr-2">✓</span>}
                {isAnswered && showWrong   && <span className="mr-2">✗</span>}
                {choice.label}
              </button>
            )
          })}
        </div>

        {/* Feedback + next */}
        {isAnswered && (
          <div className="mt-3 w-full flex items-center gap-3 flex-shrink-0">
            <p className={`flex-1 font-bold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {answers[answers.length - 1]?.correct
                ? <span className="text-green-600">{tLang('quizCorrect', frozenLang)}</span>
                : <span className="text-red-500">{tLang('quizCorrectAnswer', frozenLang)}: <strong>{question.correctCapital}</strong></span>
              }
            </p>
            <button
              onClick={handleNext}
              className={`rounded-xl font-bold text-white flex-shrink-0 bg-blue-500 hover:bg-blue-600 transition-all active:scale-95 ${isKidsFrozen ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'}`}
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

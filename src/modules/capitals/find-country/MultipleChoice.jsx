// src/modules/capitals/find-country/MultipleChoice.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Capitals › Find the Country › Multiple Choice
// Given a capital city name → pick the correct country.
//
// Question stimulus: capital name only — NO flag shown at top (would give away answer).
// Answer choices: small flag thumbnail + country name inline on every button.
// This makes choices richer and cross-trains flag recognition as a bonus.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }  from 'react'
import { useLocation, useNavigate }     from 'react-router-dom'
import { useLanguage }                  from '../../../context/LanguageContext'
import { useAgeMode }                   from '../../../context/AgeModeContext'
import { useSettings }                  from '../../../context/SettingsContext'
import { usePlayerProgress }            from '../../../hooks/usePlayerProgress'
import { generateReverseQuestions }     from '../../../utils/questionGenerator'
import FlagImage                        from '../../../components/FlagImage'

const MODULE_ID = 'capitals'
const MODE      = 'multiple-choice'
const DIRECTION = 'find-country'

export default function MultipleChoice({ countries }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { lang: liveLang, tLang }  = useLanguage()
  const { ageMode: liveAgeMode }   = useAgeMode()
  const { questionsPerRound }      = useSettings()
  const { getProgress }            = usePlayerProgress(MODULE_ID)

  const frozenLang    = location.state?.lang    ?? liveLang
  const frozenAgeMode = location.state?.ageMode ?? liveAgeMode
  const isKidsFrozen  = frozenAgeMode === 'kids'

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
      setQuestions(generateReverseQuestions(countries, frozenLang, frozenAgeMode, questionsPerRound, progress))
    }
  }, [countries, frozenLang, frozenAgeMode, questionsPerRound, getProgress])

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
    setAnswers(prev => [...prev, { question, chosen: choice.label, correct }])
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
        },
      })
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  function handleExitConfirmed() {
    navigate(`/module/${MODULE_ID}`, { state: { lang: frozenLang, ageMode: frozenAgeMode } })
  }

  const progressPct = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100
  const correctCapital = question.correctCapital ?? question.correctAnswer

  return (
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">

      {/* Top bar */}
      <div className="w-full px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-sm font-semibold transition-colors"
          >
            <span className="text-xs">✕</span>
            {tLang('exitButtonLabel', frozenLang)}
          </button>
          <span className={`font-bold text-indigo-600 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
            {tLang('quizScore', frozenLang)}: {score}
            {streak >= 2 && <span className="ml-2 text-orange-500">🔥 {streak}</span>}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="text-center mt-1 text-gray-400 text-xs">
          {tLang('quizQuestion_counter', frozenLang)} {current + 1} / {questions.length}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-3 max-w-lg mx-auto w-full">

        {/* Question — capital name only, no flag */}
        <div className="text-center mb-6 flex-shrink-0">
          <p className={`text-gray-400 mb-2 ${isKidsFrozen ? 'text-base' : 'text-xs'}`}>
            {tLang('quizReverseQuestion', frozenLang)}
          </p>
          {/* Capital displayed prominently in a card */}
          <div className={`inline-block bg-white border-2 border-indigo-100 rounded-2xl shadow-md ${isKidsFrozen ? 'px-8 py-5' : 'px-6 py-4'}`}>
            <h2 className={`font-extrabold text-gray-800 leading-tight ${isKidsFrozen ? 'text-4xl' : 'text-3xl'}`}>
              {correctCapital}
            </h2>
          </div>
        </div>

        {/* Choices — small flag thumbnail + country name */}
        <div className="w-full space-y-2 flex-shrink-0">
          {question.choices.map((choice, i) => {
            const isSelected  = selected === choice.label
            const showCorrect = isAnswered && choice.isCorrect
            const showWrong   = isAnswered && isSelected && !choice.isCorrect

            let btnClass = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
            if (showCorrect) btnClass = 'bg-green-500 border-2 border-green-500 text-white'
            if (showWrong)   btnClass = 'bg-red-400 border-2 border-red-400 text-white'

            return (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswered}
                className={`
                  w-full rounded-xl font-semibold transition-all duration-200
                  flex items-center gap-3 text-left
                  ${isKidsFrozen ? 'px-4 py-3 text-lg' : 'px-3 py-2.5 text-sm'}
                  ${btnClass}
                  ${isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                `}
              >
                {/* Small flag thumbnail */}
                <div className={`rounded overflow-hidden shadow-sm flex-shrink-0 border border-black/10 ${isKidsFrozen ? 'w-10 h-7' : 'w-9 h-6'}`}>
                  <FlagImage
                    src={choice.flag}
                    alt=""
                    className="w-full h-full object-cover"
                    isKids={isKidsFrozen}
                  />
                </div>

                {/* Country name */}
                <span className="flex-1 leading-tight">{choice.label}</span>

                {/* Result icon */}
                {isAnswered && showCorrect && <span className="ml-auto flex-shrink-0">✓</span>}
                {isAnswered && showWrong   && <span className="ml-auto flex-shrink-0">✗</span>}
              </button>
            )
          })}
        </div>

        {/* Feedback + Next */}
        {isAnswered && (
          <div className="mt-3 w-full flex items-center gap-3 flex-shrink-0">
            <p className={`flex-1 font-bold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {answers[answers.length - 1]?.correct
                ? <span className="text-green-600">{tLang('quizCorrect', frozenLang)}</span>
                : <span className="text-red-500">
                    {tLang('quizCorrectAnswer', frozenLang)}: <strong>{question.correctAnswer}</strong>
                  </span>
              }
            </p>
            <button
              onClick={handleNext}
              className={`rounded-xl font-bold text-white flex-shrink-0 bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 ${isKidsFrozen ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'}`}
            >
              {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
            </button>
          </div>
        )}
      </div>

      {/* Exit dialog */}
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

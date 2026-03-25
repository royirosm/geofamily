// src/modules/capitals/find-country/MultipleChoice.jsx
// Given a capital city → pick the correct country

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

  const { lang: liveLang, tLang }        = useLanguage()
  const { ageMode: liveAgeMode, isKids } = useAgeMode()
  const { questionsPerRound }            = useSettings()
  const { getProgress, recordRound }     = usePlayerProgress(MODULE_ID)

  const frozenLang         = location.state?.lang         ?? liveLang
  const frozenAgeMode      = location.state?.ageMode      ?? liveAgeMode
  const frozenRegionFilter = location.state?.regionFilter ?? 'all'
  const isKidsFrozen       = frozenAgeMode === 'kids'

  const [questions, setQuestions]             = useState([])
  const [current, setCurrent]                 = useState(0)
  const [selected, setSelected]               = useState(null)
  const [result, setResult]                   = useState(null)
  const [score, setScore]                     = useState(0)
  const [streak, setStreak]                   = useState(0)
  const [answers, setAnswers]                 = useState([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const generated = useRef(false)

  useEffect(() => {
    if (countries.length > 0 && !generated.current) {
      generated.current = true
      setQuestions(generateReverseQuestions(
        countries, frozenLang, frozenAgeMode, questionsPerRound,
        getProgress(), 0, frozenRegionFilter,
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

  const question    = questions[current]
  const isAnswered  = result !== null
  const isLastQ     = current === questions.length - 1
  const progressPct = ((current + (isAnswered ? 1 : 0)) / questions.length) * 100

  function handleAnswer(choice) {
    if (isAnswered) return
    const isCorrect = choice.isCorrect
    setSelected(choice.label)
    setResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) { setScore(s => s + 1); setStreak(s => s + 1) }
    else { setStreak(0) }
    setAnswers(prev => [...prev, {
      question: { country: question.country, correctAnswer: question.correctAnswer },
      correct: isCorrect, match: isCorrect ? 'correct' : 'wrong', chosen: choice.label,
    }])
  }

  function handleNext() {
    if (isLastQ) {
      const mistakes = answers.filter(a => !a.correct).map(a => a.question.country.code)
      recordRound(answers, score, answers.length, MODE, DIRECTION, mistakes)
      navigate('/results', {
        state: { score, total: questions.length, answers, moduleId: MODULE_ID,
                 direction: DIRECTION, mode: MODE, lang: frozenLang,
                 ageMode: frozenAgeMode, mistakes },
      })
    } else {
      setCurrent(c => c + 1); setResult(null); setSelected(null)
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setShowExitConfirm(true)}
            className={`text-gray-400 hover:text-gray-600 font-semibold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
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

      {/* ── Main content ── */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-3 max-w-lg mx-auto w-full">

        {/* Capital stimulus */}
        <div className="text-center mb-3 flex-shrink-0">
          <p className={`text-gray-500 mb-1 ${isKidsFrozen ? 'text-base' : 'text-xs'}`}>
            {tLang('quizReverseQuestion', frozenLang)}
          </p>
          <h2 className={`font-extrabold text-gray-800 leading-tight ${isKidsFrozen ? 'text-3xl' : 'text-2xl'}`}>
            {question.correctCapital}
          </h2>
        </div>

        {/* Choices — country name + flag */}
        <div className="w-full space-y-2 flex-shrink-0">
          {question.choices.map((choice, i) => {
            const isSelected  = selected === choice.label
            const showCorrect = isAnswered && choice.isCorrect
            const showWrong   = isAnswered && isSelected && !choice.isCorrect
            let btnClass = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            if (showCorrect) btnClass = 'bg-green-500 border-2 border-green-500 text-white'
            if (showWrong)   btnClass = 'bg-red-400   border-2 border-red-400   text-white'
            return (
              <button key={i} onClick={() => handleAnswer(choice)} disabled={isAnswered}
                className={`w-full rounded-xl px-4 font-semibold transition-all duration-200 flex items-center gap-3
                  ${isKidsFrozen ? 'py-3 text-lg' : 'py-2.5 text-sm'} ${btnClass}
                  ${isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}>
                {showCorrect && <span>✓</span>}
                {showWrong   && <span>✗</span>}
                {choice.flag && (
                  <img src={choice.flag} alt="" className={`w-8 h-6 object-cover rounded flex-shrink-0 ${showCorrect || showWrong ? 'opacity-80' : ''}`} />
                )}
                {choice.label}
              </button>
            )
          })}
        </div>

        {/* Feedback + Next */}
        {isAnswered && (
          <div className="mt-3 w-full flex items-center gap-3 flex-shrink-0">
            <p className={`flex-1 font-bold ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>
              {result === 'correct'
                ? <span className="text-green-600">{tLang('quizCorrect', frozenLang)}</span>
                : <span className="text-red-500">{tLang('quizCorrectAnswer', frozenLang)}: <strong>{question.correctAnswer}</strong></span>
              }
            </p>
            <button onClick={handleNext}
              className={`rounded-xl font-bold text-white flex-shrink-0 bg-blue-500 hover:bg-blue-600 transition-all active:scale-95
                ${isKidsFrozen ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'}`}>
              {isLastQ ? tLang('finish', frozenLang) : tLang('next', frozenLang)} →
            </button>
          </div>
        )}
      </div>

      {/* ── Exit confirm ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className={`font-extrabold text-gray-800 mb-2 ${isKidsFrozen ? 'text-xl' : 'text-lg'}`}>{tLang('exitTitle', frozenLang)}</p>
            <p className={`text-gray-500 mb-6 ${isKidsFrozen ? 'text-base' : 'text-sm'}`}>{tLang('exitMessage', frozenLang)}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitConfirm(false)}
                className={`flex-1 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-300 transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}>
                {tLang('exitCancel', frozenLang)}
              </button>
              <button onClick={() => navigate('/module/capitals')}
                className={`flex-1 rounded-2xl bg-red-500 font-bold text-white hover:bg-red-600 transition-all ${isKidsFrozen ? 'py-4 text-base' : 'py-3 text-sm'}`}>
                {tLang('exitConfirm', frozenLang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// src/modules/capitals/find-capital/TypeAnswer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Capitals › Find the Capital › Type Answer
// Given a country name + flag → type the capital city name.
// ─────────────────────────────────────────────────────────────────────────────

import TypeAnswerBase from '../../_shared/TypeAnswerBase'
import { generateQuestions } from '../../../utils/questionGenerator'
import FlagImage             from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'capitals',
  direction:   'find-capital',
  accentColor: 'blue',
  generateFn:  generateQuestions,

  // Returns what the base component renders as the question stimulus
  getQuestion(question, lang) {
    const country       = question.country
    const correctAnswer = question.correctCapital ?? question.correctAnswer
    return {
      correctAnswer,
      stimulusLabel: country.name[lang] ?? country.name.en,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          {/* Flag */}
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <FlagImage
              src={country.flag}
              alt={`Flag of ${country.name[lang]}`}
              className="w-56 h-36 object-cover"
            />
          </div>
          {/* Country name */}
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">
              {/* prompt text comes from translation key in base component */}
            </p>
            <h2 className="font-extrabold text-gray-800 text-2xl leading-tight">
              {country.name[lang] ?? country.name.en}
            </h2>
          </div>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

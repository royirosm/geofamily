// src/modules/codes/find-country/TypeAnswer.jsx
// Stimulus: 2-letter code  →  type the country name (standard fuzzy)

import TypeAnswerBase                        from '../../_shared/TypeAnswerBase'
import { generateCodeFindCountryQuestions }  from '../../../utils/questionGeneratorPhase10'

const CONFIG = {
  moduleId:    'codes',
  direction:   'find-country',
  accentColor: 'blue',
  generateFn:  generateCodeFindCountryQuestions,

  getQuestion(question, lang) {
    const country       = question.country
    const correctAnswer = question.correctAnswer  // country name

    return {
      correctAnswer,
      stimulusLabel: country.code,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="px-8 py-5 bg-blue-50 rounded-2xl border-2 border-blue-200">
            <span className="font-extrabold text-blue-700 text-5xl tracking-widest">
              {country.code}
            </span>
          </div>
          <p className="text-gray-400 text-sm font-medium">🌍 Which country has this code?</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

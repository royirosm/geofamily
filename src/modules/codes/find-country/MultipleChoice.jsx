// src/modules/codes/find-country/MultipleChoice.jsx
// Stimulus: 2-letter code  →  pick the country name

import MultipleChoiceBase                    from '../../_shared/MultipleChoiceBase'
import { generateCodeFindCountryQuestions }  from '../../../utils/questionGeneratorPhase10'

const CONFIG = {
  moduleId:    'codes',
  direction:   'find-country',
  accentColor: 'blue',
  generateFn:  generateCodeFindCountryQuestions,

  getStimulus(question, lang, isKids) {
    const { country } = question
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="px-8 py-5 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <span className={`font-extrabold text-blue-700 tracking-widest ${isKids ? 'text-6xl' : 'text-5xl'}`}>
            {country.code}
          </span>
        </div>
        <p className="text-gray-400 text-sm font-medium">🌍 Which country has this code?</p>
      </div>
    )
  },
}

export default function MultipleChoice({ countries }) {
  return <MultipleChoiceBase countries={countries} config={CONFIG} />
}

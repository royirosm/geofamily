// src/modules/currencies/find-currency/TypeAnswer.jsx
// Stimulus: country flag + name  →  type the currency name

import TypeAnswerBase                             from '../../_shared/TypeAnswerBase'
import { generateCurrencyFindCurrencyQuestions }  from '../../../utils/questionGeneratorPhase10'
import FlagImage                                  from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'currencies',
  direction:   'find-currency',
  accentColor: 'amber',
  generateFn:  generateCurrencyFindCurrencyQuestions,

  getQuestion(question, lang) {
    const country       = question.country
    const correctAnswer = question.correctAnswer  // currency name

    return {
      correctAnswer,
      stimulusLabel: country.name[lang] || country.name.en,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <FlagImage
              src={country.flag}
              alt={`Flag of ${country.name[lang]}`}
              className="w-56 h-36 object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
              {country.name[lang] || country.name.en}
            </h2>
            <p className="text-gray-400 text-sm font-medium">💰 What is the currency?</p>
          </div>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

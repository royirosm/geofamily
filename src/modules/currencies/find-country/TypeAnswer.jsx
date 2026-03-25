// src/modules/currencies/find-country/TypeAnswer.jsx
// Stimulus: currency name  →  type ANY country that uses it
// Uses TypeAnswerMultiBase for multi-valid answer support

import TypeAnswerMultiBase                       from '../../_shared/TypeAnswerMultiBase'
import { generateCurrencyFindCountryQuestions }  from '../../../utils/questionGeneratorPhase10'

const CONFIG = {
  moduleId:    'currencies',
  direction:   'find-country',
  accentColor: 'amber',
  generateFn:  generateCurrencyFindCountryQuestions,

  getQuestion(question, lang) {
    const { currencyName, currencyCode, correctAnswer, acceptedAnswers, otherValidCount } = question

    return {
      correctAnswer,
      acceptedAnswers,
      otherValidCount,
      stimulusLabel: currencyName,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">💰</div>
          <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
            {currencyName}
          </h2>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold tracking-wider">
            {currencyCode}
          </span>
          <p className="text-gray-400 text-sm font-medium">🌍 Name any country that uses this currency</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerMultiBase countries={countries} config={CONFIG} />
}

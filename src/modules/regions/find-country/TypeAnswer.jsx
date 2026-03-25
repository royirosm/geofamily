// src/modules/regions/find-country/TypeAnswer.jsx
// Stimulus: region/subregion name  →  type ANY country in that region
// Uses TypeAnswerMultiBase for multi-valid answer support

import TypeAnswerMultiBase                      from '../../_shared/TypeAnswerMultiBase'
import { generateRegionFindCountryQuestions }   from '../../../utils/questionGeneratorPhase10'

const REGION_EMOJI = {
  Africa:    '🌍',
  Americas:  '🌎',
  Asia:      '🌏',
  Europe:    '🇪🇺',
  Oceania:   '🌊',
}

const CONFIG = {
  moduleId:    'regions',
  direction:   'find-country',
  accentColor: 'green',
  generateFn:  generateRegionFindCountryQuestions,

  getQuestion(question, lang) {
    const { regionDisplay, regionKey, correctAnswer, acceptedAnswers, otherValidCount } = question
    const emoji = REGION_EMOJI[regionKey] || '🌐'

    return {
      correctAnswer,
      acceptedAnswers,
      otherValidCount,
      stimulusLabel: regionDisplay,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">{emoji}</div>
          <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
            {regionDisplay}
          </h2>
          <p className="text-gray-400 text-sm font-medium">🌍 Name any country in this region</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerMultiBase countries={countries} config={CONFIG} />
}

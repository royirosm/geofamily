// src/modules/regions/find-country/MultipleChoice.jsx
// Stimulus: region/subregion name  →  pick a country that belongs to it

import MultipleChoiceBase                       from '../../_shared/MultipleChoiceBase'
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

  getStimulus(question, lang, isKids) {
    const { regionDisplay, regionKey } = question
    const emoji = REGION_EMOJI[regionKey] || '🌐'
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">{emoji}</div>
        <h2 className={`font-extrabold text-gray-800 text-center leading-tight ${isKids ? 'text-3xl' : 'text-2xl'}`}>
          {regionDisplay}
        </h2>
        <p className="text-gray-400 text-sm font-medium">🌍 Name a country in this region</p>
      </div>
    )
  },
}

export default function MultipleChoice({ countries }) {
  return <MultipleChoiceBase countries={countries} config={CONFIG} />
}

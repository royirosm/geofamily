// src/modules/regions/find-country/Flashcard.jsx
// Front: region/subregion name
// Back:  canonical country flag + name  +  "+ N other countries" note

import FlashcardMultiBase                       from '../../_shared/FlashcardMultiBase'
import { generateRegionFindCountryQuestions }   from '../../../utils/questionGeneratorPhase10'
import FlagImage                                from '../../../components/FlagImage'

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

  getFront(question, lang) {
    const { regionDisplay, regionKey } = question
    const emoji = REGION_EMOJI[regionKey] || '🌐'
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">{emoji}</div>
        <h2 className="font-extrabold text-gray-800 text-3xl text-center leading-tight">
          {regionDisplay}
        </h2>
        <p className="text-gray-400 text-sm font-medium">🌍 Name a country in this region</p>
      </div>
    )
  },

  getBack(question, lang) {
    const country           = question.country   // canonical
    const { otherValidCount } = question

    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100">
          <FlagImage
            src={country.flag}
            alt={`Flag of ${country.name[lang]}`}
            className="w-48 h-32 object-cover"
          />
        </div>
        <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
          {country.name[lang] || country.name.en}
        </h2>
        {otherValidCount > 0 && (
          <p className="text-green-600 text-sm font-semibold text-center">
            🌍 + {otherValidCount} other {otherValidCount === 1 ? 'country' : 'countries'} in this region
          </p>
        )}
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardMultiBase countries={countries} config={CONFIG} />
}

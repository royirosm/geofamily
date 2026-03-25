// src/modules/regions/find-region/Flashcard.jsx
// Front: country flag + name  →  Back: region/subregion name

import FlashcardBase                           from '../../_shared/FlashcardBase'
import { generateRegionFindRegionQuestions }   from '../../../utils/questionGeneratorPhase10'
import FlagImage                               from '../../../components/FlagImage'

const REGION_EMOJI = {
  Africa:    '🌍',
  Americas:  '🌎',
  Asia:      '🌏',
  Europe:    '🇪🇺',
  Oceania:   '🌊',
}

const CONFIG = {
  moduleId:    'regions',
  direction:   'find-region',
  accentColor: 'green',
  generateFn:  generateRegionFindRegionQuestions,

  getFront(question, lang) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-3">
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
        <p className="text-gray-400 text-sm font-medium">🌍 Which region?</p>
      </div>
    )
  },

  getBack(question, lang) {
    const regionKey = question.regionKey
    const emoji     = REGION_EMOJI[regionKey] || '🌐'
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="text-5xl">{emoji}</div>
        <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
          {question.correctAnswer}
        </h2>
        <p className="text-gray-400 text-sm font-medium">
          {question.country.name[lang] || question.country.name.en}
        </p>
      </div>
    )
  },
}

export default function Flashcard({ countries }) {
  return <FlashcardBase countries={countries} config={CONFIG} />
}

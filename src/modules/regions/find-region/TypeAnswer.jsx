// src/modules/regions/find-region/TypeAnswer.jsx
// Stimulus: country flag + name  →  type the region/subregion
//
// The answer comes from a fixed closed list so we don't use fuzzy — we rely on
// the standard TypeAnswerBase matchAnswer() which normalises and compares.
// For kids (continents, 5 options) the answer is short and well-known.
// For familiar/expert (subregions) the answer can be longer; fuzzy tolerates
// minor typos which is appropriate.

import TypeAnswerBase                          from '../../_shared/TypeAnswerBase'
import { generateRegionFindRegionQuestions }   from '../../../utils/questionGeneratorPhase10'
import FlagImage                               from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'regions',
  direction:   'find-region',
  accentColor: 'green',
  generateFn:  generateRegionFindRegionQuestions,

  getQuestion(question, lang) {
    const country       = question.country
    const correctAnswer = question.correctAnswer  // region display name

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
          <h2 className="font-extrabold text-gray-800 text-2xl text-center leading-tight">
            {country.name[lang] || country.name.en}
          </h2>
          <p className="text-gray-400 text-sm font-medium">🌍 Which region is this country in?</p>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

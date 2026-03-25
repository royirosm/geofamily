// src/modules/regions/find-region/MultipleChoice.jsx
// Stimulus: country flag + name  →  pick the region/subregion
// Kids: continent (5 options)  |  Familiar/Expert: subregion (~22 options)

import MultipleChoiceBase                      from '../../_shared/MultipleChoiceBase'
import { generateRegionFindRegionQuestions }   from '../../../utils/questionGeneratorPhase10'
import FlagImage                               from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'regions',
  direction:   'find-region',
  accentColor: 'green',
  generateFn:  generateRegionFindRegionQuestions,

  getStimulus(question, lang, isKids) {
    const country = question.country
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
          <FlagImage
            src={country.flag}
            alt={`Flag of ${country.name[lang]}`}
            className="w-56 h-36 object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className={`font-extrabold text-gray-800 text-center leading-tight ${isKids ? 'text-2xl' : 'text-xl'}`}>
            {country.name[lang] || country.name.en}
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            🌍 Which {isKids ? 'continent' : 'region'} is this country in?
          </p>
        </div>
      </div>
    )
  },
}

export default function MultipleChoice({ countries }) {
  return <MultipleChoiceBase countries={countries} config={CONFIG} />
}

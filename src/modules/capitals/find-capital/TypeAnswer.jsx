// src/modules/capitals/find-capital/TypeAnswer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8B: TerritoryBadge added below country name in stimulus
// Phase 8C: regionFilter passed to generateQuestions via CONFIG.generateFn
//           Note: TypeAnswerBase calls config.generateFn(countries, lang, ageMode,
//           count, progress, globalMasterCount, regionFilter) — regionFilter is
//           read from location.state inside TypeAnswerBase and forwarded here.
// ─────────────────────────────────────────────────────────────────────────────

import TypeAnswerBase from '../../_shared/TypeAnswerBase'
import { generateQuestions } from '../../../utils/questionGenerator'
import FlagImage             from '../../../components/FlagImage'
import TerritoryBadge        from '../../../components/TerritoryBadge'

const CONFIG = {
  moduleId:    'capitals',
  direction:   'find-capital',
  accentColor: 'blue',
  generateFn:  generateQuestions,

  getQuestion(question, lang) {
    const country       = question.country
    const correctAnswer = question.correctCapital ?? question.correctAnswer
    return {
      correctAnswer,
      stimulusLabel: country.name[lang] ?? country.name.en,
      stimulus: (
        <div className="flex flex-col items-center gap-3">
          {/* Flag */}
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <FlagImage
              src={country.flag}
              alt={`Flag of ${country.name[lang]}`}
              className="w-56 h-36 object-cover"
            />
          </div>
          {/* Country name + territory badge */}
          <div className="flex flex-col items-center gap-1">
            <h2 className="font-extrabold text-gray-800 text-2xl leading-tight text-center">
              {country.name[lang] ?? country.name.en}
            </h2>
            {/* 8B: territory badge */}
            <TerritoryBadge sovereign={country.sovereign} lang={lang} />
          </div>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

// src/modules/flags/flag-to-country/TypeAnswer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Flags › Flag → Country › Type Answer
// Given a large flag image → type the country name.
// ─────────────────────────────────────────────────────────────────────────────

import TypeAnswerBase from '../../_shared/TypeAnswerBase'
import { generateFlagToCountryQuestions } from '../../../utils/questionGenerator'
import FlagImage                          from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'flags',
  direction:   'flag-to-country',
  accentColor: 'rose',
  generateFn:  generateFlagToCountryQuestions,

  getQuestion(question, lang) {
    const country       = question.country
    const correctAnswer = question.correctAnswer   // country name

    return {
      correctAnswer,
      stimulusLabel: correctAnswer,
      stimulus: (
        <div className="flex flex-col items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <FlagImage
              src={country.flag}
              alt="Which country is this flag?"
              className="w-64 h-40 object-cover"
            />
          </div>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

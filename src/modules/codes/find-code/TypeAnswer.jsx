// src/modules/codes/find-code/TypeAnswer.jsx
// Stimulus: country flag + name  →  type the 2-letter code
//
// Code answers are 2 uppercase letters (e.g. "IT").
// fuzzyMatch normalise() lowercases both sides, so "it" == "IT" after norm.
// We don't want fuzzy close-match on 2-char answers (too many false positives),
// so we set a tight match: only exact (after case normalisation) is correct.
// The TypeAnswerBase matchAnswer() already handles this via closeThreshold:
//   ≤4 chars → threshold 1, so "IT" vs "IR" (distance 1) would be "close".
// That's acceptable UX — "almost" shown but not counted correct.

import TypeAnswerBase                    from '../../_shared/TypeAnswerBase'
import { generateCodeFindCodeQuestions } from '../../../utils/questionGeneratorPhase10'
import FlagImage                         from '../../../components/FlagImage'

const CONFIG = {
  moduleId:    'codes',
  direction:   'find-code',
  accentColor: 'blue',
  generateFn:  generateCodeFindCodeQuestions,

  getQuestion(question, lang) {
    const country       = question.country
    const correctAnswer = question.correctAnswer  // e.g. "IT"

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
            <p className="text-gray-400 text-sm font-medium">🔤 Type the 2-letter country code</p>
          </div>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

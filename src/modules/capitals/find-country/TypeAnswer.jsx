// src/modules/capitals/find-country/TypeAnswer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Capitals › Find the Country › Type Answer
// Given a capital city name → type the country name.
// No flag shown (would give it away — same principle as MC version).
// ─────────────────────────────────────────────────────────────────────────────

import TypeAnswerBase from '../../_shared/TypeAnswerBase'
import { generateReverseQuestions } from '../../../utils/questionGenerator'

const CONFIG = {
  moduleId:    'capitals',
  direction:   'find-country',
  accentColor: 'indigo',
  generateFn:  generateReverseQuestions,

  getQuestion(question, lang) {
    const correctAnswer = question.correctAnswer   // country name
    const capital       = question.correctCapital  // the capital shown as prompt

    return {
      correctAnswer,
      stimulusLabel: capital,
      stimulus: (
        <div className="flex flex-col items-center gap-2">
          <div className="inline-block bg-white border-2 border-indigo-100 rounded-2xl shadow-md px-8 py-5">
            <h2 className="font-extrabold text-gray-800 text-4xl leading-tight text-center">
              {capital}
            </h2>
          </div>
        </div>
      ),
    }
  },
}

export default function TypeAnswer({ countries }) {
  return <TypeAnswerBase countries={countries} config={CONFIG} />
}

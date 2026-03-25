// src/modules/languages/find-country/MultipleChoice.jsx
import MultipleChoiceBase                          from '../../_shared/MultipleChoiceBase'
import { generateLanguageFindCountryQuestions }    from '../../../utils/questionGeneratorLanguagesCities'

const CONFIG = {
  moduleId:    'languages',
  direction:   'find-country',
  accentColor: 'indigo',
  generateFn:  generateLanguageFindCountryQuestions,
  getStimulus(question, lang, isKids) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">🗣️</div>
        <h2 className={`font-extrabold text-gray-800 text-center leading-tight ${isKids ? 'text-3xl' : 'text-2xl'}`}>
          {question.language}
        </h2>
        <p className="text-gray-400 text-sm font-medium">🌍 Name a country where this is the official language</p>
      </div>
    )
  },
}

export default function MultipleChoice({ countries }) {
  return <MultipleChoiceBase countries={countries} config={CONFIG} />
}

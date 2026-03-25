// src/modules/cities/find-country/MultipleChoice.jsx
import MultipleChoiceBase                      from '../../_shared/MultipleChoiceBase'
import { generateCityFindCountryQuestions }    from '../../../utils/questionGeneratorLanguagesCities'

const CONFIG = {
  moduleId:    'cities',
  direction:   'find-country',
  accentColor: 'rose',
  generateFn:  generateCityFindCountryQuestions,
  getStimulus(question, lang, isKids) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">🏙️</div>
        <h2 className={`font-extrabold text-gray-800 text-center ${isKids ? 'text-3xl' : 'text-2xl'}`}>
          {question.cityName}
        </h2>
        <p className="text-gray-400 text-sm font-medium">🌍 Which country is this city in?</p>
      </div>
    )
  },
}

export default function MultipleChoice({ countries }) {
  return <MultipleChoiceBase countries={countries} config={CONFIG} />
}

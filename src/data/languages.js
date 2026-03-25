// src/data/languages.js
// ─────────────────────────────────────────────────────────────────────────────
// Static language data for the Languages module.
//
// PRIMARY_LANGUAGE: country code → single primary language (English name)
// Overrides the first-entry heuristic from RestCountries for ambiguous cases.
//
// LANGUAGE_COUNTRIES: language → canonical country code (most recognisable)
// Used for Flashcard "find-country" back face.
//
// MINOR_LANGUAGES: set of language names to exclude from distractors
// (pidgins, sign languages, constructed languages, etc.)
// ─────────────────────────────────────────────────────────────────────────────

// Countries where the API's first language is wrong or ambiguous
// — we override with the most dominant spoken/official language
export const PRIMARY_LANGUAGE_OVERRIDE = {
  // Multi-official, pick dominant
  CH: 'German',       // Switzerland — German spoken by ~63%
  BE: 'French',       // Belgium — French + Dutch, French is international face
  CA: 'English',      // Canada — English majority
  SG: 'English',      // Singapore — English is lingua franca
  LU: 'French',       // Luxembourg — French is official/admin
  MK: 'Macedonian',   // North Macedonia
  ME: 'Serbian',      // Montenegro — Serbian dominant
  BA: 'Bosnian',      // Bosnia
  KM: 'Arabic',       // Comoros — Arabic + Comorian
  MR: 'Arabic',       // Mauritania
  // Fix API quirks
  IL: 'Hebrew',
  PK: 'Urdu',
  IN: 'Hindi',
  AF: 'Dari',         // more widely spoken than Pashto
  ET: 'Amharic',
  ZA: 'Zulu',         // largest L1 group (or use English as official)
  NG: 'English',      // Nigeria — English official, no single dominant native
  CM: 'French',       // Cameroon — French majority
  VU: 'Bislama',
}

// Language → canonical country (most recognisable country for that language)
export const CANONICAL_LANGUAGE_COUNTRY = {
  'English':    'US',
  'French':     'FR',
  'Spanish':    'ES',
  'Portuguese': 'BR',
  'Arabic':     'EG',
  'German':     'DE',
  'Russian':    'RU',
  'Chinese':    'CN',
  'Japanese':   'JP',
  'Korean':     'KR',
  'Hindi':      'IN',
  'Urdu':       'PK',
  'Bengali':    'BD',
  'Turkish':    'TR',
  'Persian':    'IR',
  'Dutch':      'NL',
  'Italian':    'IT',
  'Polish':     'PL',
  'Swedish':    'SE',
  'Norwegian':  'NO',
  'Danish':     'DK',
  'Finnish':    'FI',
  'Greek':      'GR',
  'Hungarian':  'HU',
  'Czech':      'CZ',
  'Romanian':   'RO',
  'Ukrainian':  'UA',
  'Thai':       'TH',
  'Vietnamese': 'VN',
  'Indonesian': 'ID',
  'Malay':      'MY',
  'Swahili':    'KE',
  'Amharic':    'ET',
  'Hausa':      'NG',
  'Zulu':       'ZA',
  'Hebrew':     'IL',
  'Catalan':    'ES',
}

// Languages to skip as distractors (too obscure/minor for a quiz)
export const MINOR_LANGUAGES = new Set([
  'Sign Language', 'American Sign Language', 'Bislama', 'Tok Pisin',
  'Sranan Tongo', 'Papiamento', 'Papiamentu', 'Nauruan', 'Gilbertese',
  'Marshallese', 'Palauan', 'Chamorro', 'Carolinian', 'Tuvaluan',
  'Tokelauan', 'Niuean', 'Comorian', 'Sango', 'Kirundi', 'Kinyarwanda',
  'Chichewa', 'Shona', 'Tswana', 'Sotho', 'Venda', 'Tsonga', 'Swati',
  'Ndebele', 'Xhosa', 'Tigrinya', 'Somali', 'Oromo', 'Afar',
  'Luxembourgish', 'Romansh', 'Maltese', 'Icelandic', 'Faroese',
  'Greenlandic', 'Welsh', 'Irish', 'Scottish Gaelic', 'Basque', 'Galician',
])

// ── Greek translations for language names ─────────────────────────────────────
export const LANGUAGE_NAMES_EL = {
  'Afrikaans':    'Αφρικάανς',
  'Albanian':     'Αλβανικά',
  'Amharic':      'Αμχαρικά',
  'Arabic':       'Αραβικά',
  'Armenian':     'Αρμενικά',
  'Azerbaijani':  'Αζερμπαϊτζανικά',
  'Basque':       'Βασκικά',
  'Belarusian':   'Λευκορωσικά',
  'Bengali':      'Μπενγκάλι',
  'Bosnian':      'Βοσνιακά',
  'Bulgarian':    'Βουλγαρικά',
  'Catalan':      'Καταλανικά',
  'Chinese':      'Κινεζικά',
  'Croatian':     'Κροατικά',
  'Czech':        'Τσεχικά',
  'Danish':       'Δανικά',
  'Dari':         'Ντάρι',
  'Dutch':        'Ολλανδικά',
  'English':      'Αγγλικά',
  'Estonian':     'Εσθονικά',
  'Finnish':      'Φινλανδικά',
  'French':       'Γαλλικά',
  'Georgian':     'Γεωργιανά',
  'German':       'Γερμανικά',
  'Greek':        'Ελληνικά',
  'Hausa':        'Χάουσα',
  'Hebrew':       'Εβραϊκά',
  'Hindi':        'Χίντι',
  'Hungarian':    'Ουγγρικά',
  'Icelandic':    'Ισλανδικά',
  'Indonesian':   'Ινδονησιακά',
  'Italian':      'Ιταλικά',
  'Japanese':     'Ιαπωνικά',
  'Kazakh':       'Καζακικά',
  'Khmer':        'Χμερ',
  'Korean':       'Κορεατικά',
  'Kurdish':      'Κουρδικά',
  'Kyrgyz':       'Κιργιζικά',
  'Lao':          'Λαοτινά',
  'Latvian':      'Λετονικά',
  'Lithuanian':   'Λιθουανικά',
  'Macedonian':   'Μακεδονικά',
  'Malay':        'Μαλαϊκά',
  'Mongolian':    'Μογγολικά',
  'Nepali':       'Νεπαλικά',
  'Norwegian':    'Νορβηγικά',
  'Pashto':       'Πάστο',
  'Persian':      'Περσικά',
  'Polish':       'Πολωνικά',
  'Portuguese':   'Πορτογαλικά',
  'Romanian':     'Ρουμανικά',
  'Russian':      'Ρωσικά',
  'Serbian':      'Σερβικά',
  'Sinhala':      'Σινχαλεζικά',
  'Slovak':       'Σλοβακικά',
  'Slovenian':    'Σλοβενικά',
  'Somali':       'Σομαλικά',
  'Spanish':      'Ισπανικά',
  'Swahili':      'Σουαχίλι',
  'Swedish':      'Σουηδικά',
  'Tagalog':      'Ταγκαλόγκ',
  'Tajik':        'Τατζικικά',
  'Tamil':        'Ταμίλ',
  'Thai':         'Ταϊλανδικά',
  'Turkish':      'Τουρκικά',
  'Turkmen':      'Τουρκμενικά',
  'Ukrainian':    'Ουκρανικά',
  'Urdu':         'Ουρντού',
  'Uzbek':        'Ουζμπεκικά',
  'Vietnamese':   'Βιετναμικά',
  'Welsh':        'Ουαλικά',
  'Yoruba':       'Γιορούμπα',
  'Zulu':         'Ζουλού',
}

// Helper: get language name in given language
export function getLanguageName(languageEn, lang) {
  if (lang === 'el') return LANGUAGE_NAMES_EL[languageEn] || languageEn
  return languageEn
}

// src/data/currencies.js
// ─────────────────────────────────────────────────────────────────────────────
// Static currency data for the Currencies module.
//
// CANONICAL_CURRENCY_COUNTRY maps a currency code → the single most
// recognisable country that uses it. Used by:
//   - Flashcard "find-country" back face (show one country, not many)
//   - Question generator as the authoritative primary display country
//
// CURRENCY_NAMES provides bilingual (en/el) display names for currencies
// because RestCountries returns only the English name.
//
// SHARED_CURRENCY_NOTE is shown on flashcard backs when a currency is used
// by multiple countries, e.g. "also used by 18 other countries".
// ─────────────────────────────────────────────────────────────────────────────

// Currency code → canonical (most recognisable) country code
export const CANONICAL_CURRENCY_COUNTRY = {
  EUR: 'DE',   // Euro → Germany (largest Eurozone economy)
  USD: 'US',   // US Dollar → United States
  GBP: 'GB',   // British Pound → United Kingdom
  AUD: 'AU',   // Australian Dollar → Australia
  NZD: 'NZ',   // New Zealand Dollar → New Zealand
  XOF: 'SN',   // West African CFA franc → Senegal (most populous user)
  XAF: 'CM',   // Central African CFA franc → Cameroon
  XCD: 'AG',   // East Caribbean Dollar → Antigua (alphabetically first)
  DKK: 'DK',   // Danish Krone → Denmark (also used by Faroe Islands/Greenland)
  NOK: 'NO',   // Norwegian Krone → Norway
  CHF: 'CH',   // Swiss Franc → Switzerland (also Liechtenstein)
  INR: 'IN',   // Indian Rupee → India (also Bhutan)
}

// How many countries share a given currency (for the educational note)
export const CURRENCY_COUNTRY_COUNT = {
  EUR: 20,  // 20 Eurozone members (as of 2024)
  USD: 9,   // US + 8 territories/dollarised states
  XOF: 8,
  XAF: 6,
  XCD: 8,
  AUD: 6,   // Australia + Pacific territories
  NZD: 5,
  DKK: 3,
  NOK: 2,
  CHF: 2,
  INR: 2,
}

// Bilingual currency display names
// Keyed by ISO 4217 currency code
export const CURRENCY_NAMES = {
  AFN: { en: 'Afghan Afghani',          el: 'Αφγανικό Αφγάνι' },
  ALL: { en: 'Albanian Lek',            el: 'Αλβανικό Λεκ' },
  DZD: { en: 'Algerian Dinar',          el: 'Αλγερινό Δηνάριο' },
  AOA: { en: 'Angolan Kwanza',          el: 'Αγκολέζικο Κουάνζα' },
  ARS: { en: 'Argentine Peso',          el: 'Αργεντινό Πέσο' },
  AMD: { en: 'Armenian Dram',           el: 'Αρμενικό Δράμ' },
  AWG: { en: 'Aruban Florin',           el: 'Φλορίνι Αρούμπα' },
  AUD: { en: 'Australian Dollar',       el: 'Αυστραλιανό Δολάριο' },
  AZN: { en: 'Azerbaijani Manat',       el: 'Αζερμπαϊτζανικό Μανάτ' },
  BSD: { en: 'Bahamian Dollar',         el: 'Δολάριο Μπαχαμών' },
  BHD: { en: 'Bahraini Dinar',          el: 'Δηνάριο Μπαχρέιν' },
  BDT: { en: 'Bangladeshi Taka',        el: 'Τάκα Μπανγκλαντές' },
  BBD: { en: 'Barbadian Dollar',        el: 'Δολάριο Μπαρμπάντος' },
  BYN: { en: 'Belarusian Ruble',        el: 'Λευκορωσικό Ρούβλι' },
  BZD: { en: 'Belize Dollar',           el: 'Δολάριο Μπελίζ' },
  BMD: { en: 'Bermudian Dollar',        el: 'Δολάριο Βερμούδων' },
  BTN: { en: 'Bhutanese Ngultrum',      el: 'Νγκούλτρουμ Μπουτάν' },
  BOB: { en: 'Bolivian Boliviano',      el: 'Βολιβιάνο Βολιβίας' },
  BAM: { en: 'Bosnian Mark',            el: 'Μάρκο Βοσνίας' },
  BWP: { en: 'Botswanan Pula',          el: 'Πούλα Μποτσουάνα' },
  BRL: { en: 'Brazilian Real',          el: 'Βραζιλιάνικο Ρεάλ' },
  BND: { en: 'Brunei Dollar',           el: 'Δολάριο Μπρουνέι' },
  BGN: { en: 'Bulgarian Lev',           el: 'Βουλγαρικό Λεβ' },
  BIF: { en: 'Burundian Franc',         el: 'Φράγκο Μπουρούντι' },
  CVE: { en: 'Cape Verdean Escudo',     el: 'Εσκούδο Πράσινου Ακρωτηρίου' },
  KHR: { en: 'Cambodian Riel',          el: 'Ριέλ Καμπότζης' },
  CAD: { en: 'Canadian Dollar',         el: 'Καναδικό Δολάριο' },
  KYD: { en: 'Cayman Islands Dollar',   el: 'Δολάριο Νήσων Κέιμαν' },
  XAF: { en: 'Central African CFA Franc', el: 'ΧΦΑ Φράγκο Κεντρικής Αφρικής' },
  CLP: { en: 'Chilean Peso',            el: 'Χιλιανό Πέσο' },
  CNY: { en: 'Chinese Yuan',            el: 'Κινεζικό Γιουάν' },
  COP: { en: 'Colombian Peso',          el: 'Κολομβιανό Πέσο' },
  KMF: { en: 'Comorian Franc',          el: 'Φράγκο Κομορών' },
  CDF: { en: 'Congolese Franc',         el: 'Φράγκο Κονγκό' },
  CRC: { en: 'Costa Rican Colón',       el: 'Κολόν Κόστα Ρίκα' },
  HRK: { en: 'Croatian Kuna',           el: 'Κούνα Κροατίας' },
  CUP: { en: 'Cuban Peso',              el: 'Κουβανικό Πέσο' },
  CZK: { en: 'Czech Koruna',            el: 'Κορόνα Τσεχίας' },
  DKK: { en: 'Danish Krone',            el: 'Δανέζικη Κορόνα' },
  DJF: { en: 'Djiboutian Franc',        el: 'Φράγκο Τζιμπουτί' },
  DOP: { en: 'Dominican Peso',          el: 'Πέσο Δομινικανής Δημοκρατίας' },
  XCD: { en: 'East Caribbean Dollar',   el: 'Δολάριο Ανατολικής Καραϊβικής' },
  EGP: { en: 'Egyptian Pound',          el: 'Αιγυπτιακή Λίρα' },
  ERN: { en: 'Eritrean Nakfa',          el: 'Νάκφα Ερυθραίας' },
  SZL: { en: 'Eswatini Lilangeni',      el: 'Λιλανγκένι Εσουατίνι' },
  ETB: { en: 'Ethiopian Birr',          el: 'Μπιρ Αιθιοπίας' },
  EUR: { en: 'Euro',                    el: 'Ευρώ' },
  FJD: { en: 'Fijian Dollar',           el: 'Δολάριο Φίτζι' },
  GMD: { en: 'Gambian Dalasi',          el: 'Νταλάζι Γκάμπια' },
  GEL: { en: 'Georgian Lari',           el: 'Λάρι Γεωργίας' },
  GHS: { en: 'Ghanaian Cedi',           el: 'Σέντι Γκάνα' },
  GTQ: { en: 'Guatemalan Quetzal',      el: 'Κέτσαλ Γουατεμάλα' },
  GNF: { en: 'Guinean Franc',           el: 'Φράγκο Γουινέας' },
  GYD: { en: 'Guyanese Dollar',         el: 'Δολάριο Γουιάνας' },
  HTG: { en: 'Haitian Gourde',          el: 'Γκουρντ Αϊτής' },
  HNL: { en: 'Honduran Lempira',        el: 'Λέμπιρα Ονδούρας' },
  HKD: { en: 'Hong Kong Dollar',        el: 'Δολάριο Χονγκ Κονγκ' },
  HUF: { en: 'Hungarian Forint',        el: 'Φιορίνι Ουγγαρίας' },
  ISK: { en: 'Icelandic Króna',         el: 'Κρόνα Ισλανδίας' },
  INR: { en: 'Indian Rupee',            el: 'Ινδική Ρουπία' },
  IDR: { en: 'Indonesian Rupiah',       el: 'Ρουπία Ινδονησίας' },
  IRR: { en: 'Iranian Rial',            el: 'Ριάλ Ιράν' },
  IQD: { en: 'Iraqi Dinar',             el: 'Δηνάριο Ιράκ' },
  ILS: { en: 'Israeli Shekel',          el: 'Ισραηλινό Σέκελ' },
  JMD: { en: 'Jamaican Dollar',         el: 'Δολάριο Τζαμάικα' },
  JPY: { en: 'Japanese Yen',            el: 'Ιαπωνικό Γιεν' },
  JOD: { en: 'Jordanian Dinar',         el: 'Δηνάριο Ιορδανίας' },
  KZT: { en: 'Kazakhstani Tenge',       el: 'Τένγκε Καζακστάν' },
  KES: { en: 'Kenyan Shilling',         el: 'Σελίνι Κένυας' },
  KWD: { en: 'Kuwaiti Dinar',           el: 'Δηνάριο Κουβέιτ' },
  KGS: { en: 'Kyrgyzstani Som',         el: 'Σομ Κιργιζίας' },
  LAK: { en: 'Lao Kip',                 el: 'Κιπ Λάος' },
  LBP: { en: 'Lebanese Pound',          el: 'Λιβανέζικη Λίρα' },
  LSL: { en: 'Lesotho Loti',            el: 'Λότι Λεσόθο' },
  LRD: { en: 'Liberian Dollar',         el: 'Δολάριο Λιβερίας' },
  LYD: { en: 'Libyan Dinar',            el: 'Δηνάριο Λιβύης' },
  CHF: { en: 'Swiss Franc',             el: 'Ελβετικό Φράγκο' },
  MOP: { en: 'Macanese Pataca',         el: 'Πατάκα Μακάο' },
  MKD: { en: 'Macedonian Denar',        el: 'Δηνάριο Βόρειας Μακεδονίας' },
  MGA: { en: 'Malagasy Ariary',         el: 'Αριάρι Μαδαγασκάρης' },
  MWK: { en: 'Malawian Kwacha',         el: 'Κουάτσα Μαλάουι' },
  MYR: { en: 'Malaysian Ringgit',       el: 'Ρινγκίτ Μαλαισίας' },
  MVR: { en: 'Maldivian Rufiyaa',       el: 'Ρουφιγιά Μαλδίβων' },
  MRU: { en: 'Mauritanian Ouguiya',     el: 'Ουγκουίγια Μαυριτανίας' },
  MUR: { en: 'Mauritian Rupee',         el: 'Ρουπία Μαυρίκιου' },
  MXN: { en: 'Mexican Peso',            el: 'Μεξικανικό Πέσο' },
  MDL: { en: 'Moldovan Leu',            el: 'Λέου Μολδαβίας' },
  MNT: { en: 'Mongolian Tögrög',        el: 'Τόγκρογκ Μογγολίας' },
  MAD: { en: 'Moroccan Dirham',         el: 'Ντίρχαμ Μαρόκου' },
  MZN: { en: 'Mozambican Metical',      el: 'Μετικάλ Μοζαμβίκης' },
  MMK: { en: 'Burmese Kyat',            el: 'Κιάτ Μιανμάρ' },
  NAD: { en: 'Namibian Dollar',         el: 'Δολάριο Ναμίμπια' },
  NPR: { en: 'Nepalese Rupee',          el: 'Ρουπία Νεπάλ' },
  NIO: { en: 'Nicaraguan Córdoba',      el: 'Κόρδοβα Νικαράγουα' },
  NGN: { en: 'Nigerian Naira',          el: 'Νάιρα Νιγηρίας' },
  NOK: { en: 'Norwegian Krone',         el: 'Νορβηγική Κορόνα' },
  OMR: { en: 'Omani Rial',              el: 'Ριάλ Ομάν' },
  PKR: { en: 'Pakistani Rupee',         el: 'Ρουπία Πακιστάν' },
  PAB: { en: 'Panamanian Balboa',       el: 'Μπαλμπόα Παναμά' },
  PGK: { en: 'Papua New Guinean Kina',  el: 'Κίνα Παπούα Νέας Γουινέας' },
  PYG: { en: 'Paraguayan Guaraní',      el: 'Γκουαρανί Παραγουάης' },
  PEN: { en: 'Peruvian Sol',            el: 'Σολ Περού' },
  PHP: { en: 'Philippine Peso',         el: 'Πέσο Φιλιππίνων' },
  PLN: { en: 'Polish Złoty',            el: 'Ζλότι Πολωνίας' },
  QAR: { en: 'Qatari Riyal',            el: 'Ριάλ Κατάρ' },
  RON: { en: 'Romanian Leu',            el: 'Λέου Ρουμανίας' },
  RUB: { en: 'Russian Ruble',           el: 'Ρωσικό Ρούβλι' },
  RWF: { en: 'Rwandan Franc',           el: 'Φράγκο Ρουάντα' },
  WST: { en: 'Samoan Tālā',             el: 'Τάλα Σαμόα' },
  STN: { en: 'São Tomé Dobra',          el: 'Ντόμπρα Σ. Θωμά' },
  SAR: { en: 'Saudi Riyal',             el: 'Ριάλ Σαουδικής Αραβίας' },
  RSD: { en: 'Serbian Dinar',           el: 'Δηνάριο Σερβίας' },
  SCR: { en: 'Seychellois Rupee',       el: 'Ρουπία Σεϋχελλών' },
  SLL: { en: 'Sierra Leonean Leone',    el: 'Λεόνε Σιέρα Λεόνε' },
  SGD: { en: 'Singapore Dollar',        el: 'Δολάριο Σιγκαπούρης' },
  SBD: { en: 'Solomon Islands Dollar',  el: 'Δολάριο Νήσων Σολομώντα' },
  SOS: { en: 'Somali Shilling',         el: 'Σελίνι Σομαλίας' },
  ZAR: { en: 'South African Rand',      el: 'Ραντ Νότιας Αφρικής' },
  KRW: { en: 'South Korean Won',        el: 'Γουόν Νότιας Κορέας' },
  SSP: { en: 'South Sudanese Pound',    el: 'Λίρα Νότιου Σουδάν' },
  LKR: { en: 'Sri Lankan Rupee',        el: 'Ρουπία Σρι Λάνκα' },
  SDG: { en: 'Sudanese Pound',          el: 'Λίρα Σουδάν' },
  SRD: { en: 'Surinamese Dollar',       el: 'Δολάριο Σουρινάμ' },
  SEK: { en: 'Swedish Krona',           el: 'Σουηδική Κορόνα' },
  SYP: { en: 'Syrian Pound',            el: 'Συριακή Λίρα' },
  TWD: { en: 'New Taiwan Dollar',       el: 'Νέο Δολάριο Ταϊβάν' },
  TJS: { en: 'Tajikistani Somoni',      el: 'Σομόνι Τατζικιστάν' },
  TZS: { en: 'Tanzanian Shilling',      el: 'Σελίνι Τανζανίας' },
  THB: { en: 'Thai Baht',               el: 'Μπατ Ταϊλάνδης' },
  XOF: { en: 'West African CFA Franc',  el: 'ΧΦΑ Φράγκο Δυτικής Αφρικής' },
  TOP: { en: 'Tongan Paʻanga',          el: 'Παάνγκα Τόνγκα' },
  TTD: { en: 'Trinidad Dollar',         el: 'Δολάριο Τρινιντάντ' },
  TND: { en: 'Tunisian Dinar',          el: 'Δηνάριο Τυνησίας' },
  TRY: { en: 'Turkish Lira',            el: 'Τουρκική Λίρα' },
  TMT: { en: 'Turkmenistan Manat',      el: 'Μανάτ Τουρκμενιστάν' },
  UGX: { en: 'Ugandan Shilling',        el: 'Σελίνι Ουγκάντα' },
  UAH: { en: 'Ukrainian Hryvnia',       el: 'Ουκρανική Χρυβνία' },
  AED: { en: 'UAE Dirham',              el: 'Ντίρχαμ Ηνωμένων Αραβικών Εμιράτων' },
  GBP: { en: 'British Pound',           el: 'Βρετανική Λίρα' },
  USD: { en: 'US Dollar',               el: 'Αμερικανικό Δολάριο' },
  UYU: { en: 'Uruguayan Peso',          el: 'Πέσο Ουρουγουάης' },
  UZS: { en: 'Uzbekistani Som',         el: 'Σομ Ουζμπεκιστάν' },
  VUV: { en: 'Vanuatu Vatu',            el: 'Βατού Βανουάτου' },
  VES: { en: 'Venezuelan Bolívar',      el: 'Μπολιβάρ Βενεζουέλας' },
  VND: { en: 'Vietnamese Đồng',         el: 'Ντονγκ Βιετνάμ' },
  YER: { en: 'Yemeni Rial',             el: 'Ριάλ Υεμένης' },
  ZMW: { en: 'Zambian Kwacha',          el: 'Κουάτσα Ζάμπια' },
  ZWL: { en: 'Zimbabwean Dollar',       el: 'Δολάριο Ζιμπάμπουε' },
}

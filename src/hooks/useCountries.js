// useCountries.js
// Fetches country data from RestCountries API in both English and Greek,
// merges them into bilingual objects, and caches the result in localStorage for 24 hours.
// Returns: { countries, loading, error }
//
// Each country object shape:
// {
//   code: "GR",
//   name:    { en: "Greece",  el: "Ελλάδα" },
//   capital: { en: "Athens",  el: "Αθήνα"  },
//   flag:    "https://...",
//   region:  "Europe",
//   subregion: "Southern Europe",
//   population: 10000000,
// }

import { useState, useEffect } from 'react'

const API_BASE = 'https://restcountries.com/v3.1'
// nativeName is part of the name field - Greek comes from name.nativeName.ell.common
const FIELDS   = 'name,capital,flags,region,subregion,population,cca2'
const CACHE_KEY = 'geofamily_countries'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useCountries() {
  const [countries, setCountries]  = useState([])
  const [loading, setLoading]      = useState(true)
  const [error, setError]          = useState(null)

  useEffect(() => {
    async function loadCountries() {
      try {
        // --- 1. Check localStorage cache first ---
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const isStillFresh = Date.now() - timestamp < CACHE_DURATION_MS
          if (isStillFresh) {
            setCountries(data)
            setLoading(false)
            return
          }
        }

        // --- 2. Cache miss or expired — single fetch (translations included in FIELDS) ---
        // The translations field already contains all languages including Greek (ell).
        // No second request needed.
        const enResponse = await fetch(`${API_BASE}/all?fields=${FIELDS}`)
        if (!enResponse.ok) throw new Error(`API error: ${enResponse.status}`)
        const enData = await enResponse.json()

        // --- 3. Normalize ---
        // Greek country names come from c.name.nativeName.ell.common (built into the name field).

        // --- 4a. Greek country name overrides ---
        // nativeName.ell only works for Greece/Cyprus (countries that speak Greek).
        // All other countries need manual Greek translations.
        const greekCountries = {
          AF: 'Αφγανιστάν',        AL: 'Αλβανία',           DZ: 'Αλγερία',
          AD: 'Ανδόρα',            AO: 'Ανγκόλα',           AG: 'Αντίγκουα και Μπαρμπούντα',
          AR: 'Αργεντινή',         AM: 'Αρμενία',           AU: 'Αυστραλία',
          AT: 'Αυστρία',           AZ: 'Αζερμπαϊτζάν',      BS: 'Μπαχάμες',
          BH: 'Μπαχρέιν',         BD: 'Μπανγκλαντές',      BB: 'Μπαρμπάντος',
          BY: 'Λευκορωσία',        BE: 'Βέλγιο',            BZ: 'Μπελίζ',
          BJ: 'Μπενίν',            BT: 'Μπουτάν',           BO: 'Βολιβία',
          BA: 'Βοσνία-Ερζεγοβίνη', BW: 'Μποτσουάνα',        BR: 'Βραζιλία',
          BN: 'Μπρουνέι',          BG: 'Βουλγαρία',         BF: 'Μπουρκίνα Φάσο',
          BI: 'Μπουρούντι',        CV: 'Πράσινο Ακρωτήριο', KH: 'Καμπότζη',
          CM: 'Καμερούν',          CA: 'Καναδάς',            CF: 'Κεντροαφρικανική Δημοκρατία',
          TD: 'Τσαντ',             CL: 'Χιλή',              CN: 'Κίνα',
          CO: 'Κολομβία',          KM: 'Κομόρες',           CG: 'Κονγκό',
          CD: 'Λαϊκή Δημοκρατία του Κονγκό', CR: 'Κόστα Ρίκα', HR: 'Κροατία',
          CU: 'Κούβα',             CY: 'Κύπρος',            CZ: 'Τσεχία',
          DK: 'Δανία',             DJ: 'Τζιμπουτί',         DM: 'Ντομίνικα',
          DO: 'Δομινικανή Δημοκρατία', EC: 'Ισημερινός',    EG: 'Αίγυπτος',
          SV: 'Ελ Σαλβαδόρ',       GQ: 'Ισημερινή Γουινέα', ER: 'Ερυθραία',
          EE: 'Εσθονία',           SZ: 'Εσουατίνι',         ET: 'Αιθιοπία',
          FJ: 'Φίτζι',             FI: 'Φινλανδία',         FR: 'Γαλλία',
          GA: 'Γκαμπόν',           GM: 'Γκάμπια',           GE: 'Γεωργία',
          DE: 'Γερμανία',          GH: 'Γκάνα',             GR: 'Ελλάδα',
          GD: 'Γρενάδα',           GT: 'Γουατεμάλα',        GN: 'Γουινέα',
          GW: 'Γουινέα-Μπισσάου',  GY: 'Γουιάνα',           HT: 'Αϊτή',
          HN: 'Ονδούρα',           HU: 'Ουγγαρία',          IS: 'Ισλανδία',
          IN: 'Ινδία',             ID: 'Ινδονησία',          IR: 'Ιράν',
          IQ: 'Ιράκ',              IE: 'Ιρλανδία',           IL: 'Ισραήλ',
          IT: 'Ιταλία',            JM: 'Τζαμάικα',           JP: 'Ιαπωνία',
          JO: 'Ιορδανία',          KZ: 'Καζακστάν',          KE: 'Κένυα',
          KI: 'Κιριμπάτι',         KW: 'Κουβέιτ',            KG: 'Κιργιζία',
          LA: 'Λάος',              LV: 'Λετονία',             LB: 'Λίβανος',
          LS: 'Λεσότο',            LR: 'Λιβερία',             LY: 'Λιβύη',
          LI: 'Λιχτενστάιν',       LT: 'Λιθουανία',          LU: 'Λουξεμβούργο',
          MG: 'Μαδαγασκάρη',       MW: 'Μαλάουι',            MY: 'Μαλαισία',
          MV: 'Μαλδίβες',          ML: 'Μάλι',               MT: 'Μάλτα',
          MH: 'Νήσοι Μάρσαλ',      MR: 'Μαυριτανία',         MU: 'Μαυρίκιος',
          MX: 'Μεξικό',            FM: 'Μικρονησία',          MD: 'Μολδαβία',
          MC: 'Μονακό',            MN: 'Μογγολία',            ME: 'Μαυροβούνιο',
          MA: 'Μαρόκο',            MZ: 'Μοζαμβίκη',           MM: 'Μιανμάρ',
          NA: 'Ναμίμπια',          NR: 'Ναουρού',             NP: 'Νεπάλ',
          NL: 'Ολλανδία',          NZ: 'Νέα Ζηλανδία',        NI: 'Νικαράγουα',
          NE: 'Νίγηρας',           NG: 'Νιγηρία',             MK: 'Βόρεια Μακεδονία',
          NO: 'Νορβηγία',          OM: 'Ομάν',                PK: 'Πακιστάν',
          PW: 'Παλάου',            PA: 'Παναμάς',             PG: 'Παπούα Νέα Γουινέα',
          PY: 'Παραγουάη',         PE: 'Περού',               PH: 'Φιλιππίνες',
          PL: 'Πολωνία',           PT: 'Πορτογαλία',          QA: 'Κατάρ',
          RO: 'Ρουμανία',          RU: 'Ρωσία',               RW: 'Ρουάντα',
          KN: 'Σαιντ Κιτς και Νέβις', LC: 'Αγία Λουκία',     VC: 'Άγιος Βικέντιος',
          WS: 'Σαμόα',             SM: 'Άγιος Μαρίνος',       ST: 'Σάο Τομέ και Πρίνσιπε',
          SA: 'Σαουδική Αραβία',   SN: 'Σενεγάλη',            RS: 'Σερβία',
          SC: 'Σεϋχέλλες',         SL: 'Σιέρα Λεόνε',         SG: 'Σιγκαπούρη',
          SK: 'Σλοβακία',          SI: 'Σλοβενία',             SB: 'Νήσοι Σολομώντος',
          SO: 'Σομαλία',           ZA: 'Νότια Αφρική',         SS: 'Νότιο Σουδάν',
          ES: 'Ισπανία',           LK: 'Σρι Λάνκα',            SD: 'Σουδάν',
          SR: 'Σουρινάμ',          SE: 'Σουηδία',              CH: 'Ελβετία',
          SY: 'Συρία',             TW: 'Ταϊβάν',               TJ: 'Τατζικιστάν',
          TZ: 'Τανζανία',          TH: 'Ταϊλάνδη',             TL: 'Ανατολικό Τιμόρ',
          TG: 'Τόγκο',             TO: 'Τόνγκα',               TT: 'Τρινιντάντ και Τομπάγκο',
          TN: 'Τυνησία',           TR: 'Τουρκία',               TM: 'Τουρκμενιστάν',
          TV: 'Τουβαλού',          UG: 'Ουγκάντα',              UA: 'Ουκρανία',
          AE: 'Ηνωμένα Αραβικά Εμιράτα', GB: 'Ηνωμένο Βασίλειο', US: 'Ηνωμένες Πολιτείες',
          UY: 'Ουρουγουάη',        UZ: 'Ουζμπεκιστάν',          VU: 'Βανουάτου',
          VE: 'Βενεζουέλα',        VN: 'Βιετνάμ',               YE: 'Υεμένη',
          ZM: 'Ζάμπια',            ZW: 'Ζιμπάμπουε',
        }

        // --- 4b. Greek capital overrides ---
        // The RestCountries API does not provide translated capital names.
        // This map covers the most common countries. Expand as needed.
        const greekCapitals = {
          AF: 'Καμπούλ',       AL: 'Τίρανα',       DZ: 'Αλγέρι',
          AD: 'Ανδόρα Λα Βέγια', AO: 'Λουάντα',   AG: 'Σεντ Τζονς',
          AR: 'Μπουένος Άιρες', AM: 'Ερεβάν',       AU: 'Καμπέρα',
          AT: 'Βιέννη',         AZ: 'Μπακού',       BS: 'Νάσσαου',
          BH: 'Μανάμα',         BD: 'Ντάκα',         BB: 'Μπρίτζταουν',
          BY: 'Μινσκ',          BE: 'Βρυξέλλες',    BZ: 'Μπελμοπάν',
          BJ: 'Πόρτο-Νόβο',    BT: 'Θίμφου',        BO: 'Σούκρε',
          BA: 'Σαράγεβο',       BW: 'Γκαμπορόνε',   BR: 'Μπραζίλια',
          BN: 'Μπάντερ Σερί Μπεγκαβάν', BG: 'Σόφια', BF: 'Ουαγκαντούγκου',
          BI: 'Γκιτέγκα',       CV: 'Πράια',         KH: 'Πνομ Πεν',
          CM: 'Γιαουντέ',       CA: 'Οτάβα',         CF: 'Μπανγκί',
          TD: 'Ντζαμένα',       CL: 'Σαντιάγο',     CN: 'Πεκίνο',
          CO: 'Μπογκοτά',       KM: 'Μορόνι',        CG: 'Μπραζαβίλ',
          CR: 'Σαν Χοσέ',       HR: 'Ζάγκρεμπ',     CU: 'Αβάνα',
          CY: 'Λευκωσία',       CZ: 'Πράγα',         DK: 'Κοπεγχάγη',
          DJ: 'Τζιμπουτί',      DM: 'Ρόζο',          DO: 'Σάντο Ντομίνγκο',
          EC: 'Κίτο',           EG: 'Κάιρο',          SV: 'Σαν Σαλβαδόρ',
          GQ: 'Μαλάμπο',        ER: 'Ασμάρα',         EE: 'Ταλίν',
          SZ: 'Ομπαβάνε',       ET: 'Αντίς Αμπέμπα',  FJ: 'Σούβα',
          FI: 'Ελσίνκι',        FR: 'Παρίσι',         GA: 'Λιμπρεβίλ',
          GM: 'Μπανζούλ',       GE: 'Τιφλίδα',        DE: 'Βερολίνο',
          GH: 'Άκρα',           GR: 'Αθήνα',          GD: 'Σεντ Τζόρτζ',
          GT: 'Γουατεμάλα',     GN: 'Κόνακρι',        GW: 'Μπισσάου',
          GY: 'Τζόρτζταουν',   HT: 'Πορτ-ο-Πρενς',   HN: 'Τεγκουσιγκάλπα',
          HU: 'Βουδαπέστη',     IS: 'Ρέικιαβικ',       IN: 'Νέο Δελχί',
          ID: 'Τζακάρτα',       IR: 'Τεχεράνη',        IQ: 'Βαγδάτη',
          IE: 'Δουβλίνο',       IL: 'Ιερουσαλήμ',      IT: 'Ρώμη',
          JM: 'Κίνγκστον',      JP: 'Τόκιο',            JO: 'Αμμάν',
          KZ: 'Αστάνα',         KE: 'Ναϊρόμπι',         KI: 'Σαουτ Ταραβά',
          KW: 'Κουβέιτ',        KG: 'Μπισκέκ',          LA: 'Βιεντιάν',
          LV: 'Ρίγα',           LB: 'Βηρυτός',          LS: 'Μασέρου',
          LR: 'Μονρόβια',       LY: 'Τρίπολη',           LI: 'Βαντούτς',
          LT: 'Βίλνιους',       LU: 'Λουξεμβούργο',     MG: 'Αντανανάριβο',
          MW: 'Λιλόνγκουε',     MY: 'Κουάλα Λουμπούρ',  MV: 'Μαλέ',
          ML: 'Μπαμακό',        MT: 'Βαλέτα',           MH: 'Μαζούρο',
          MR: 'Νουακσότ',       MU: 'Πορ Λουί',          MX: 'Μεξικό',
          FM: 'Παλικίρ',        MD: 'Κισινάου',          MC: 'Μονακό',
          MN: 'Ουλάν Μπατόρ',   ME: 'Ποντγκόριτσα',     MA: 'Ραμπάτ',
          MZ: 'Μαπούτο',        MM: 'Νεϊπιντό',          NA: 'Βίντχουκ',
          NR: 'Γιάρεν',         NP: 'Κατμαντού',          NL: 'Άμστερνταμ',
          NZ: 'Ουέλινγκτον',    NI: 'Μανάγκουα',          NE: 'Νιαμέι',
          NG: 'Αμπούζα',        MK: 'Σκόπια',              NO: 'Όσλο',
          OM: 'Μασκάτ',         PK: 'Ισλαμαμπάντ',         PW: 'Νγκερουλμούντ',
          PA: 'Πανάμα',         PG: 'Πορτ Μόρεσμπι',       PY: 'Ασουνσιόν',
          PE: 'Λίμα',           PH: 'Μανίλα',               PL: 'Βαρσοβία',
          PT: 'Λισαβόνα',       QA: 'Ντόχα',                RO: 'Βουκουρέστι',
          RU: 'Μόσχα',          RW: 'Κιγκάλι',              KN: 'Μπαστέρ',
          LC: 'Καστρί',         VC: 'Κίνγκσταουν',          WS: 'Απία',
          SM: 'Σαν Μαρίνο',     ST: 'Σάο Τομέ',             SA: 'Ριάντ',
          SN: 'Ντακάρ',         RS: 'Βελιγράδι',            SC: 'Βικτόρια',
          SL: 'Φρίταουν',       SG: 'Σιγκαπούρη',           SK: 'Μπρατισλάβα',
          SI: 'Λιουμπλιάνα',    SB: 'Ονιάρα',               SO: 'Μογκαντίσου',
          ZA: 'Πρετόρια',       SS: 'Τζούμπα',              ES: 'Μαδρίτη',
          LK: 'Κολόμπο',        SD: 'Χαρτούμ',              SR: 'Παραμαρίμπο',
          SE: 'Στοκχόλμη',      CH: 'Βέρνη',                SY: 'Δαμασκός',
          TW: 'Ταϊπέι',         TJ: 'Ντουσαμπέ',            TZ: 'Ντοντόμα',
          TH: 'Μπανγκόκ',       TL: 'Ντίλι',                TG: 'Λομέ',
          TO: 'Νουκουαλόφα',    TT: 'Πορτ οφ Σπέιν',        TN: 'Τύνιδα',
          TR: 'Άγκυρα',         TM: 'Ασγκαμπάτ',            TV: 'Φουναφούτι',
          UG: 'Καμπάλα',        UA: 'Κίεβο',                 AE: 'Αμπού Ντάμπι',
          GB: 'Λονδίνο',        US: 'Ουάσιγκτον',            UY: 'Μοντεβιδέο',
          UZ: 'Τασκένδη',       VU: 'Πορτ Βίλα',             VE: 'Καράκας',
          VN: 'Ανόι',           YE: 'Σαναά',                  ZM: 'Λουσάκα',
          ZW: 'Χαράρε',
        }

        // --- 5. Normalize into bilingual objects ---
        const normalized = enData
          .filter(c => c.capital && c.capital.length > 0)
          .map(c => ({
            code:       c.cca2,
            name: {
              en: c.name.common,
              // greekCountries map first, then nativeName.ell (works for GR/CY), then English fallback
              el: greekCountries[c.cca2] || c.name.nativeName?.ell?.common || c.name.common,
            },
            capital: {
              en: c.capital[0],
              el: greekCapitals[c.cca2] || c.capital[0], // fallback to English
            },
            flag:       c.flags?.svg || c.flags?.png,
            region:     c.region,
            subregion:  c.subregion,
            population: c.population,
          }))
          .sort((a, b) => a.name.en.localeCompare(b.name.en))

        // --- 6. Save to localStorage cache ---
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data:      normalized,
          timestamp: Date.now(),
        }))

        setCountries(normalized)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCountries()
  }, [])

  return { countries, loading, error }
}

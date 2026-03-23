// src/utils/fuzzyMatch.js
// ─────────────────────────────────────────────────────────────────────────────
// Fuzzy matching utility for Type Answer mode.
//
// Three-tier result system:
//   'correct' — exact match after normalisation (case + accent insensitive)
//   'close'   — Levenshtein distance ≤ 2 (typo tolerance)
//   'wrong'   — everything else
//
// For scoring purposes:
//   'correct' → correct++ in SRS
//   'close'   → wrong++ in SRS  (encourages, but doesn't inflate)
//   'wrong'   → wrong++ in SRS
//
// Usage:
//   import { matchAnswer } from '../utils/fuzzyMatch'
//   const result = matchAnswer(typed, correctAnswer)
//   // result.match: 'correct' | 'close' | 'wrong'
//   // result.isCorrect: boolean (true only for 'correct')
// ─────────────────────────────────────────────────────────────────────────────

// ── Normalisation ─────────────────────────────────────────────────────────────
// Strip accents, lowercase, trim whitespace.
// "Reykjavík" → "reykjavik"
// "São Paulo"  → "sao paulo"

function normalise(str) {
  if (!str) return ''
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')                    // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')     // strip combining diacritics
    .replace(/\s+/g, ' ')               // collapse multiple spaces
}

// ── Levenshtein distance ──────────────────────────────────────────────────────
// Standard dynamic-programming implementation.
// Returns the edit distance between two strings (insertions, deletions, substitutions).

function levenshtein(a, b) {
  const m = a.length
  const n = b.length

  // Short-circuit trivial cases
  if (m === 0) return n
  if (n === 0) return m
  if (a === b) return 0

  // Only keep two rows to save memory
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        curr[j - 1] + 1,       // insertion
        prev[j] + 1,           // deletion
        prev[j - 1] + cost     // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

// ── Close threshold ───────────────────────────────────────────────────────────
// Max edit distance to be considered "close" rather than "wrong".
// 2 allows for one transposition + one typo, e.g. "Athnes" → "Athens"
// For very short answers (≤4 chars) we tighten to 1 to avoid false positives.

function closeThreshold(correctAnswer) {
  return normalise(correctAnswer).length <= 4 ? 1 : 2
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * matchAnswer(typed, correct)
 *
 * @param {string} typed   — what the player typed
 * @param {string} correct — the correct answer
 * @returns {{ match: 'correct'|'close'|'wrong', isCorrect: boolean, distance: number }}
 */
export function matchAnswer(typed, correct) {
  const normTyped   = normalise(typed)
  const normCorrect = normalise(correct)

  // Empty input is always wrong
  if (!normTyped) return { match: 'wrong', isCorrect: false, distance: normCorrect.length }

  // Exact match after normalisation
  if (normTyped === normCorrect) return { match: 'correct', isCorrect: true, distance: 0 }

  // Levenshtein distance
  const distance  = levenshtein(normTyped, normCorrect)
  const threshold = closeThreshold(correct)

  if (distance <= threshold) return { match: 'close', isCorrect: false, distance }

  return { match: 'wrong', isCorrect: false, distance }
}

/**
 * getHintLetters(answer, count)
 * Returns the first `count` letters of the answer (normalised display form).
 * Used by the progressive hint system.
 *
 * @param {string} answer  — the correct answer
 * @param {number} count   — how many letters to reveal (1–3)
 * @returns {string[]}     — array of revealed chars, e.g. ['A', 't', 'h']
 */
export function getHintLetters(answer, count) {
  if (!answer) return []
  // Strip leading/trailing spaces but preserve internal structure
  const chars = answer.trim().split('')
  return chars.slice(0, Math.min(count, chars.length))
}

// src/lib/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8A: Added Firebase Anonymous Auth.
// Fix 10: Explicitly enable IndexedDB offline persistence so the PWA works
//         fully offline. persistentMultipleTabManager allows the same family
//         to be open in multiple browser tabs simultaneously.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp }                        from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
}                                               from 'firebase/firestore'
import { getAuth }                              from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

// Explicit IndexedDB persistence — replaces getFirestore() default
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

export const auth = getAuth(app)

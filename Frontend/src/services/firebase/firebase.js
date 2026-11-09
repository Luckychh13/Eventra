import { initializeApp } from 'firebase/app'
import {
    getAuth,
    connectAuthEmulator,
} from 'firebase/auth'

const useAuthEmulator =
    import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

    projectId: useAuthEmulator
        ? 'demo-eventra'
        : import.meta.env.VITE_FIREBASE_PROJECT_ID,

    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)

if (useAuthEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099')
}

export default firebaseApp
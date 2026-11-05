import { useState, useEffect } from 'react'
import {onAuthStateChanged} from 'firebase/auth'
import  {AuthContext } from './AuthContext.js'
import { auth } from '../services/firebase/firebase.js'

function AuthProvider({ children }) {
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth,(FirebaseUser) => {
            setUser(FirebaseUser)
            setLoading(false)
        })

        return () => unsubscribe()
    },[])
    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import app from '../lib/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useMemo(() => getAuth(app), [])
  const db = useMemo(() => getFirestore(app), [])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null)
        setLoading(false)
        return
      }

      const userRef = doc(db, 'users', user.uid)
      const snapshot = await getDoc(userRef)

      if (snapshot.exists()) {
        setCurrentUser({ uid: user.uid, email: user.email, ...snapshot.data() })
      } else {
        const fallback = {
          uid: user.uid,
          email: user.email,
          role: 'user',
          credits: 10000,
          createdAt: serverTimestamp(),
        }
        await setDoc(userRef, fallback)
        setCurrentUser(fallback)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, db])

  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, 'users', user.uid)
    const snapshot = await getDoc(userRef)

    if (snapshot.exists()) {
      setCurrentUser({ uid: user.uid, email: user.email, ...snapshot.data() })
    } else {
      const fallback = {
        uid: user.uid,
        email: user.email,
        role: 'user',
        credits: 10000,
        createdAt: serverTimestamp(),
      }
      await setDoc(userRef, fallback)
      setCurrentUser(fallback)
    }

    return user
  }

  const register = async (email, password, displayName = '') => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    const userDoc = {
      uid: user.uid,
      email: user.email,
      name: displayName,
      role: 'user',
      credits: 10000,
      createdAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'users', user.uid), userDoc)
    setCurrentUser(userDoc)

    return user
  }

  const logout = async () => {
    await signOut(auth)
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({ currentUser, loading, login, register, logout }),
    [currentUser, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
